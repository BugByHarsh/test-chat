const metrics = {
  startedAt: Date.now(),
  matchesHuman: 0,
  matchesBot: 0,
  messagesSent: 0,
  skips: 0,
  reports: 0,
  bans: 0,
};

export function inc(key, n = 1) {
  metrics[key] = (metrics[key] || 0) + n;
}

export function snapshot() {
  return { ...metrics, uptimeMs: Date.now() - metrics.startedAt };
}