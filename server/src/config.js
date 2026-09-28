import "dotenv/config";

function num(key, def) {
  const v = process.env[key];
  return v === undefined ? def : Number(v);
}

const isProduction = process.env.NODE_ENV === "production";
const ipHashSalt = process.env.IP_HASH_SALT;

if (isProduction && !ipHashSalt) {
  throw new Error("IP_HASH_SALT is required in production.");
}

export const config = {
  port: num("PORT", 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  ipHashSalt: ipHashSalt || "dev-only-salt",
  holdTimerMs: num("HOLD_TIMER_MS", 2500),
  interestFallbackMs: num("INTEREST_FALLBACK_MS", 5000),
  botMaxRatio: num("BOT_MAX_RATIO", 0.3),
  botLifetimeMinMs: num("BOT_LIFETIME_MIN_MS", 40000),
  botLifetimeMaxMs: num("BOT_LIFETIME_MAX_MS", 110000),
  msgRateLimit: num("MSG_RATE_LIMIT", 6),
  msgRateWindowMs: num("MSG_RATE_WINDOW_MS", 10000),
  skipCooldownMs: num("SKIP_COOLDOWN_MS", 3000),
  banReportThreshold: num("BAN_REPORT_THRESHOLD", 3),
  banDurationMs: num("BAN_DURATION_MS", 24 * 60 * 60 * 1000),
  maxMessageLen: num("MAX_MESSAGE_LEN", 500),
};