export function captureVideoFrame() {
  const video =
    document.querySelector("video[data-remote='true']") ||
    Array.from(document.querySelectorAll("video")).find((v) => !v.muted);
  if (!video) return null;
  if (!video.videoWidth || !video.videoHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return null;
  }
}