import { config } from "./config.js";

// Simple profanity / bad-word list. Replace with a real one later.
const BAD_WORDS = [
  "nigger", "faggot", "kys", "kill yourself",
];
const SEXUAL_WORDS = ["nude", "nudes", "horny", "sext"];
const LINK_RE = /(https?:\/\/|www\.)\S+/i;
const MINOR_WORDS = ["underage", "13yo", "14yo", "15yo", "16yo", "17yo"];

const bans = new Map(); // ipHash -> { until, reason }
const reports = []; // { reporterHash, reportedHash, reason, ts, snapshot }

export function isBanned(ipHash) {
  const b = bans.get(ipHash);
  if (!b) return null;
  if (b.until < Date.now()) {
    bans.delete(ipHash);
    return null;
  }
  return b;
}

export function banUser(ipHash, reason, durationMs = config.banDurationMs) {
  bans.set(ipHash, { until: Date.now() + durationMs, reason });
}

export function checkMessage(text) {
  const lower = text.toLowerCase();
  if (text.length > config.maxMessageLen) {
    return { ok: false, reason: "too_long" };
  }
  if (LINK_RE.test(text)) {
    return { ok: false, reason: "links_blocked" };
  }
  for (const w of BAD_WORDS) {
    if (lower.includes(w)) return { ok: false, reason: "profanity" };
  }
  for (const w of SEXUAL_WORDS) {
    if (lower.includes(w)) return { ok: false, reason: "sexual" };
  }
  for (const w of MINOR_WORDS) {
    if (lower.includes(w)) return { ok: false, reason: "minor" };
  }
  return { ok: true };
}

export function addReport({ reporterHash, reportedHash, reason, snapshot }) {
  const r = { reporterHash, reportedHash, reason, snapshot: snapshot || [], ts: Date.now() };
  reports.push(r);
  if (reports.length > 1000) reports.shift();

  // count unique reporters for this target
  const reporters = new Set(
    reports.filter((x) => x.reportedHash === reportedHash).map((x) => x.reporterHash)
  );
  if (reporters.size >= config.banReportThreshold) {
    banUser(reportedHash, "reported");
    return { banned: true, reporters: reporters.size };
  }
  return { banned: false, reporters: reporters.size };
}

export function allReports() {
  return reports.slice();
}