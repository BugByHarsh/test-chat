import { useCallback, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { useChat } from "../store/chatStore";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  ...(import.meta.env.VITE_TURN_URLS
    ? [{
        urls: import.meta.env.VITE_TURN_URLS
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        username: import.meta.env.VITE_TURN_USERNAME || undefined,
        credential: import.meta.env.VITE_TURN_CREDENTIAL || undefined,
      }]
    : []),
];

const ICE_RESTART_DELAY_MS = 1500;

export function useWebRTC() {
  const pcRef = useRef(null);
  const pendingIce = useRef([]);
  const roleRef = useRef(null);
  const iceRestartedRef = useRef(false);
  const failureHandledRef = useRef(false);
  const restartTimerRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const roomIdRef = useRef(null);

  const {
    status,
    mode,
    role,
    setRemoteStream,
    setIceState,
    showToast,
    updateWebRTCDebug,
    resetWebRTCDebug,
  } = useChat();

  useEffect(() => {
    roleRef.current = role;
    updateWebRTCDebug({ role: role || null, lastEvent: role ? `role: ${role}` : "role: none" });
  }, [role, updateWebRTCDebug]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    clearRestartTimer();

    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = null;
      pc.onicecandidateerror = null;
      pc.ontrack = null;
      pc.oniceconnectionstatechange = null;
      pc.onconnectionstatechange = null;
      pc.onsignalingstatechange = null;

      try {
        pc.getSenders().forEach((sender) => {
          try {
            pc.removeTrack(sender);
          } catch {}
        });
      } catch {}

      try {
        pc.close();
      } catch {}
    }

    pcRef.current = null;
    pendingIce.current = [];
    updateWebRTCDebug({
      pcState: "closed",
      connectionState: "closed",
      signalingState: "closed",
      role: roleRef.current,
      remoteTracks: [],
      lastEvent: "pc: teardown",
    });
    remoteStreamRef.current = null;
    roomIdRef.current = null;
    iceRestartedRef.current = false;
    failureHandledRef.current = false;
    setRemoteStream(null);
    setIceState("new");
  }, [clearRestartTimer, setRemoteStream, setIceState]);

  const createPC = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    resetWebRTCDebug();

    const currentRoomId = useChat.getState().roomId;
    roomIdRef.current = currentRoomId;

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 2,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        updateWebRTCDebug({ iceSent: useChat.getState().webrtcDebug.iceSent + 1, lastEvent: "ICE: candidate sent" });
        socket.emit("webrtc_ice", {
          candidate: event.candidate.toJSON(),
          roomId: roomIdRef.current,
        });
      }
    };

    pc.onicecandidateerror = (event) => {
      // Keep this diagnostic-only. A single STUN/TURN candidate error does not
      // necessarily mean the peer connection will fail.
      updateWebRTCDebug({ iceErrors: useChat.getState().webrtcDebug.iceErrors + 1, lastError: `ICE candidate error ${event.errorCode || "unknown"}: ${event.errorText || ""}`, lastEvent: "ICE: candidate error" });
      if (event.errorCode && event.errorCode >= 700 && event.errorCode !== 701) {
        console.warn("[WebRTC] ICE candidate error", {
          code: event.errorCode,
          text: event.errorText,
          url: event.url,
        });
      }
    };

    pc.ontrack = (event) => {
      let stream = event.streams?.[0];

      // Some browsers can deliver a track without an associated stream.
      // Keep one stable remote stream so audio/video tracks are combined.
      if (!stream) {
        stream = remoteStreamRef.current || new MediaStream();
        stream.addTrack(event.track);
      }

      remoteStreamRef.current = stream;
      setRemoteStream(stream);
      updateWebRTCDebug({
        remoteTracks: stream.getTracks().map((t) => `${t.kind}:${t.readyState}:${t.enabled}`),
        lastEvent: `track: ${event.track.kind} received`,
      });
    };

    const fail = (message = "Call connection failed. Skipping…") => {
      if (failureHandledRef.current) return;
      failureHandledRef.current = true;
      showToast(message, "error");
      socket.emit("skip", { source: "connection_failure" });
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setIceState(state);
      updateWebRTCDebug({ iceState: state, connectionState: pc.connectionState, signalingState: pc.signalingState, lastEvent: `ICE: ${state}` });

      if (state === "connected" || state === "completed") {
        iceRestartedRef.current = false;
        failureHandledRef.current = false;
        clearRestartTimer();
        return;
      }

      if (
        (state === "disconnected" || state === "failed") &&
        roleRef.current === "caller" &&
        !iceRestartedRef.current
      ) {
        iceRestartedRef.current = true;
        clearRestartTimer();

        restartTimerRef.current = setTimeout(async () => {
          restartTimerRef.current = null;

          if (
            pcRef.current !== pc ||
            pc.connectionState === "closed" ||
            roleRef.current !== "caller"
          ) {
            return;
          }

          try {
            pc.restartIce();
            const offer = await pc.createOffer({ iceRestart: true });
            await pc.setLocalDescription(offer);

            socket.emit("webrtc_offer", {
              sdp: pc.localDescription,
              roomId: roomIdRef.current,
            });
          } catch (error) {
            console.error("[WebRTC] ICE restart failed", error);
            fail("Call connection failed. Skipping…");
          }
        }, ICE_RESTART_DELAY_MS);

        return;
      }

      if (state === "failed" && iceRestartedRef.current) {
        fail("Call connection failed. Skipping…");
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      updateWebRTCDebug({ connectionState: state, iceState: pc.iceConnectionState, signalingState: pc.signalingState, lastEvent: `PC: ${state}` });

      if (state === "connected") {
        setIceState(pc.iceConnectionState);
        failureHandledRef.current = false;
        return;
      }

      if (state === "failed") {
        if (
          roleRef.current === "caller" &&
          !iceRestartedRef.current
        ) {
          // Let the ICE state handler perform the single restart.
          return;
        }

        fail("Call connection failed. Skipping…");
      }
    };

    pc.onsignalingstatechange = () => {
      updateWebRTCDebug({ signalingState: pc.signalingState, connectionState: pc.connectionState, lastEvent: `signaling: ${pc.signalingState}` });
      if (pc.signalingState === "closed") {
        setIceState("closed");
      }
    };

    // Media is requested immediately before start(), so the hook's render-time
    // localStream can still be stale. Read the latest stream directly from the store.
    const currentLocalStream = useChat.getState().localStream;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, currentLocalStream);

        // Let the browser adapt video bitrate under congestion instead of
        // allowing an unnecessarily high encode rate. Audio remains under
        // the browser's Opus rate controller.
        if (track.kind === "video") {
          try {
            const parameters = sender.getParameters();
            const encodings = parameters.encodings?.length
              ? parameters.encodings
              : [{}];

            encodings.forEach((encoding) => {
              encoding.maxBitrate = 650_000;
              encoding.maxFramerate = 24;
            });

            parameters.encodings = encodings;
            if ("degradationPreference" in parameters) {
              parameters.degradationPreference = "maintain-framerate";
            }

            void sender.setParameters(parameters).catch(() => {});
          } catch {}
        }
      });
    }

    pcRef.current = pc;
    updateWebRTCDebug({
      pcState: "created",
      connectionState: pc.connectionState,
      iceState: pc.iceConnectionState,
      signalingState: pc.signalingState,
      role: roleRef.current,
      localTracks: currentLocalStream?.getTracks().map((t) => `${t.kind}:${t.readyState}:${t.enabled}`) || [],
      lastEvent: currentLocalStream?.getTracks().length
        ? "pc: created + local tracks"
        : "pc: created without local tracks",
    });
    return pc;
  }, [
    clearRestartTimer,
    setRemoteStream,
    setIceState,
    showToast,
    updateWebRTCDebug,
    resetWebRTCDebug,
  ]);

  const flushIce = useCallback(async (pc) => {
    if (!pc.remoteDescription) return;

    const candidates = pendingIce.current.splice(0);
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.warn("[WebRTC] Failed to add queued ICE candidate", error);
      }
    }
  }, []);

  const start = useCallback(async () => {
    teardown();
    createPC();
  }, [teardown, createPC]);

  const negotiate = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || roleRef.current !== "caller") return;
    if (pc.signalingState !== "stable") return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      updateWebRTCDebug({ offersSent: useChat.getState().webrtcDebug.offersSent + 1, signalingState: pc.signalingState, lastEvent: "signal: offer sent" });
      socket.emit("webrtc_offer", {
        sdp: pc.localDescription,
        roomId: roomIdRef.current,
      });
    } catch (error) {
      console.error("[WebRTC] Failed to create offer", error);
      showToast("Failed to start the call.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    const onOffer = async ({ sdp, roomId }) => {
      if (!roomId || roomId !== useChat.getState().roomId) return;
      updateWebRTCDebug({ offersReceived: useChat.getState().webrtcDebug.offersReceived + 1, lastEvent: "signal: offer received" });
      if (roleRef.current !== "callee") return;

      const pc = pcRef.current || createPC();

      try {
        // Ignore a duplicate/stale offer while another offer is being applied.
        if (pc.signalingState !== "stable") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setLocalDescription({ type: "rollback" });
          } else {
            return;
          }
        }

        await pc.setRemoteDescription(sdp);
        await flushIce(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        updateWebRTCDebug({ answersSent: useChat.getState().webrtcDebug.answersSent + 1, signalingState: pc.signalingState, lastEvent: "signal: answer sent" });
        socket.emit("webrtc_answer", {
          sdp: pc.localDescription,
        });
      } catch (error) {
        console.error("[WebRTC] Failed to accept offer", error);
        showToast("Failed to connect the call.", "error");
      }
    };

    const onAnswer = async ({ sdp, roomId }) => {
      if (!roomId || roomId !== useChat.getState().roomId) return;
      updateWebRTCDebug({ answersReceived: useChat.getState().webrtcDebug.answersReceived + 1, lastEvent: "signal: answer received" });
      const pc = pcRef.current;
      if (!pc || roleRef.current !== "caller") return;

      try {
        await pc.setRemoteDescription(sdp);
        await flushIce(pc);
      } catch (error) {
        console.error("[WebRTC] Failed to accept answer", error);
        showToast("Failed to finish the call connection.", "error");
      }
    };

    const onIce = async ({ candidate, roomId }) => {
      if (!candidate || !roomId || roomId !== useChat.getState().roomId) return;
      updateWebRTCDebug({ iceReceived: useChat.getState().webrtcDebug.iceReceived + 1, lastEvent: "ICE: candidate received" });

      const pc = pcRef.current;

      if (!pc || !pc.remoteDescription) {
        pendingIce.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.warn("[WebRTC] Failed to add ICE candidate", error);
      }
    };

    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice", onIce);

    return () => {
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice", onIce);
    };
  }, [createPC, flushIce, showToast]);

  // A PeerConnection belongs to a matched room, not to the search phase.
  // Wait until matchmaking has assigned roomId/role, then create the PC using
  // the latest local media stream. This prevents the "created -> immediately
  // torn down while searching -> matched with no PC" race.
  useEffect(() => {
    if (
      status === "chatting" &&
      mode !== "text" &&
      role &&
      !pcRef.current
    ) {
      start();
    }
  }, [status, mode, role, start]);

  useEffect(() => {
    if (
      status === "chatting" &&
      mode !== "text" &&
      role === "caller" &&
      pcRef.current
    ) {
      negotiate();
    }
  }, [status, mode, role, negotiate]);

  useEffect(() => {
    if (status !== "chatting" && mode !== "text") {
      teardown();
    }
  }, [status, mode, teardown]);

  return { start, teardown };
}
