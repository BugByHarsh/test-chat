const MAX_FRAME_WIDTH = 640;
const MAX_FRAME_DATA_LENGTH = 700_000;

export function captureVideoFrame() {
  const video =
    document.querySelector("video[data-remote='true']") ||
    Array.from(document.querySelectorAll("video")).find((v) => !v.muted);
  if (!video) return null;
  if (!video.videoWidth || !video.videoHeight) return null;

  const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL("image/jpeg", 0.55);
    return frame.length <= MAX_FRAME_DATA_LENGTH ? frame : null;
  } catch {
    return null;
  }
}
