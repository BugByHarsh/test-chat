export function checkMessageRate(session, limit, windowMs) {
  const now = Date.now();
  session.msgTimestamps = session.msgTimestamps.filter((t) => now - t < windowMs);
  if (session.msgTimestamps.length >= limit) {
    const oldest = session.msgTimestamps[0];
    const retryAfter = windowMs - (now - oldest);
    return { ok: false, retryAfter };
  }
  session.msgTimestamps.push(now);
  return { ok: true };
}

export function checkSkipCooldown(session, cooldownMs) {
  const now = Date.now();
  if (now - session.lastSkipAt < cooldownMs) {
    return { ok: false, retryAfter: cooldownMs - (now - session.lastSkipAt) };
  }
  session.lastSkipAt = now;
  return { ok: true };
}