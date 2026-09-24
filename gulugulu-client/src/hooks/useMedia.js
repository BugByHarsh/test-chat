import { useCallback, useRef } from "react";
import { useChat } from "../store/chatStore";

export function useMedia() {
  const streamRef = useRef(null);
  const {
    setLocalStream, setMediaPermission, setMediaError,
    setMicOn, setCamOn, micOn, camOn,
  } = useChat();

  const request = useCallback(
    async (opts) => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setMediaPermission("unavailable");
          setMediaError("Your browser does not support camera/microphone.");
          return null;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: opts.audio,
          video: opts.video
            ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
            : false,
        });
        streamRef.current = stream;
        setLocalStream(stream);
        setMediaPermission("granted");
        setMediaError(null);
        setMicOn(stream.getAudioTracks().some((t) => t.enabled));
        setCamOn(stream.getVideoTracks().some((t) => t.enabled));
        return stream;
      } catch (e) {
        const name = e?.name || "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setMediaPermission("denied");
          setMediaError("Permission denied. Enable camera/mic in your browser settings.");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setMediaPermission("unavailable");
          setMediaError("No camera or microphone found.");
        } else if (name === "NotReadableError") {
          setMediaPermission("unavailable");
          setMediaError("Camera or mic is in use by another app.");
        } else {
          setMediaPermission("denied");
          setMediaError(e?.message || "Could not access media.");
        }
        return null;
      }
    },
    [setLocalStream, setMediaPermission, setMediaError, setMicOn, setCamOn]
  );

  const stop = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
  }, [setLocalStream]);

  const toggleMic = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    const next = !micOn;
    s.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, [micOn, setMicOn]);

  const toggleCam = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    const next = !camOn;
    s.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
  }, [camOn, setCamOn]);

  const getStream = useCallback(() => streamRef.current, []);

  return { request, stop, toggleMic, toggleCam, getStream };
}