let ctx = null;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep(freq, dur = 0.08, gain = 0.04) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.value = gain;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {}
}

export const sounds = {
  match: () => { beep(660); setTimeout(() => beep(880), 90); },
  msg: () => beep(520, 0.05, 0.02),
  skip: () => beep(300, 0.06, 0.03),
  error: () => beep(180, 0.12, 0.05),
};