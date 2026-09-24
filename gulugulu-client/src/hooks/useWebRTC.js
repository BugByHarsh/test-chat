import { useCallback, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { useChat } from "../store/chatStore";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC() {
  const pcRef = useRef(null);
  const pendingIce = useRef([]);
  const {
    status, mode, role, localStream,
    setRemoteStream, setIceState, showToast,
  } = useChat();

  const teardown = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      try {
        pc.getSenders().forEach((s) => s.track && s.track.stop && s.track.stop());
      } catch {}
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.oniceconnectionstatechange = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    pcRef.current = null;
    pendingIce.current = [];
    setRemoteStream(null);
    setIceState("new");
  }, [setRemoteStream, setIceState]);

  const createPC = useCallback(async () => {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc_ice", { candidate: e.candidate.toJSON() });
      }
    };

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (stream) setRemoteStream(stream);
    };

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      setIceState(s);
      if (s === "failed") {
        showToast("Connection failed. Skipping…", "error");
        socket.emit("skip");
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        showToast("Peer connection failed.", "error");
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    }

    pcRef.current = pc;
    return pc;
  }, [localStream, setRemoteStream, setIceState, showToast]);

  const flushIce = useCallback(async (pc) => {
    if (!pc.remoteDescription) return;
    while (pendingIce.current.length) {
      const c = pendingIce.current.shift();
      try { await pc.addIceCandidate(c); } catch {}
    }
  }, []);

  const start = useCallback(async () => {
    teardown();
    await createPC();
  }, [teardown, createPC]);

  const negotiate = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || role !== "caller") return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { sdp: pc.localDescription });
    } catch {
      showToast("Failed to create offer.", "error");
    }
  }, [role, showToast]);

  useEffect(() => {
    const onOffer = async ({ sdp }) => {
      if (role !== "callee") return;
      const pc = pcRef.current || (await createPC());
      try {
        await pc.setRemoteDescription(sdp);
        await flushIce(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { sdp: pc.localDescription });
      } catch {
        showToast("Failed to accept video offer.", "error");
      }
    };

    const onAnswer = async ({ sdp }) => {
      const pc = pcRef.current;
      if (!pc || role !== "caller") return;
      try {
        await pc.setRemoteDescription(sdp);
        await flushIce(pc);
      } catch {}
    };

    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc) { pendingIce.current.push(candidate); return; }
      if (!pc.remoteDescription) { pendingIce.current.push(candidate); return; }
      try { await pc.addIceCandidate(candidate); } catch {}
    };

    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice", onIce);

    return () => {
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice", onIce);
    };
  }, [role, createPC, flushIce, showToast]);

  useEffect(() => {
    if (status === "chatting" && mode !== "text" && role === "caller") {
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