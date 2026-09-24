function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9?\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INTENTS = {
  greeting: [/^(hi|hii|hey|heyy|hello|yo|sup|wassup)\??$/, /^(what s up|whats up)\??$/],
  name: [/\b(name|ur name|your name)\b/, /\bwhat should i call (you|u)\b/, /\bwho are you\b/],
  age: [/\bage\b/, /\bhow old\b/, /\bhow old r u\b/, /\bhow old are u\b/, /\byour age\b/, /\bur age\b/, /\bwhat age\b/, /\bwhich age\b/, /\b(?:are|r|r u|you|u) (?:18|19|20|21|22|23|24|25|26|27|28|29|30)\b/],
  location: [/\bwhere (?:are|r) (?:you|u) from\b/, /\bwhere (?:you|u) from\b/, /\bfrom where\b/, /\bwhere from\b/, /\bwhich city\b/, /\bwhat city\b/, /\bcity\b/, /\bcountry\b/, /\bwhich country\b/, /\bwhat country\b/, /\bwhere do (?:you|u) live\b/, /\bwhere (?:are|r) (?:you|u)\b/, /\b(?:u|you) from\b/, /^from\??$/],
  gender: [/\bm or f\b/, /\bmale or female\b/, /\bboy or girl\b/, /\bare u a girl\b/, /\bare you a girl\b/, /\bare u female\b/, /\bare you female\b/, /\bgender\b/, /^f\??$/, /^m\??$/],
};

const AGE_RE = /(?:^|\s|[^a-z])(1[89]|[2-9]\d)(?:\s*(?:yo|y\/o|years?))?(?=\s|$|[^a-z])/i;
const GENDER_RE = /(?:^|[\s,])([fm])(?=\d|\s|$|[,?.!])/i;
const KNOWN_LOCATIONS = ["delhi","mumbai","bangalore","bengaluru","kolkata","chennai","hyderabad","pune","jaipur","lucknow","noida","gurgaon","gurugram","chandigarh","agra","kanpur","saharanpur","india","nepal","dubai","london","usa","uk"];

export function normalizeText(text) { return normalize(text); }

export function pickLine(arr, used) {
  if (!arr || !arr.length) return null;
  const fresh = arr.filter((l) => !used.has(l));
  const pool = fresh.length ? fresh : arr;
  const line = pool[Math.floor(Math.random() * pool.length)];
  used.add(line);
  return line;
}

export function detectIntents(text) {
  const normalized = normalize(text);
  if (!normalized) return [];
  return Object.entries(INTENTS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(normalized)))
    .map(([intent]) => intent);
}

export function detectIntent(text) {
  return detectIntents(text)[0] || null;
}

export function extractSignals(text) {
  const normalized = normalize(text);
  const signals = {};

  const age = normalized.match(AGE_RE);
  if (age) signals.age = Number(age[1]);

  // Do not treat "m or f?" as a male answer. Compact forms like
  // "F23", "F Delhi", "M here", and "21 M" are still recognized.
  if (!/^(m|f)\s+or\s+(m|f)\??$/.test(normalized)) {
    const gender = normalized.match(GENDER_RE);
    if (gender) signals.gender = gender[1].toLowerCase() === "f" ? "female" : "male";
  }

  const words = normalized.split(/\s+/);
  const location = KNOWN_LOCATIONS.find((place) => words.includes(place));
  if (location) signals.location = location;

  if (detectIntents(normalized).includes("name") && !normalized.includes("?")) {
    const candidate = normalized.replace(/^(my name is|i am|im|i'm|name is)\s+/, "").trim();
    if (candidate && candidate.split(/\s+/).length <= 3 && !/\d/.test(candidate)) signals.name = candidate;
  }

  return signals;
}

function remember(state, signals) {
  state.facts ||= {};
  for (const [key, value] of Object.entries(signals)) state.facts[key] = value;
}

function chooseNextIntent(state) {
  const candidates = Object.keys(state.script.intents || {}).filter((intent) => intent !== "greeting");
  const missing = candidates.filter((intent) => {
    if (intent === "name") return !state.facts?.name;
    if (intent === "age") return !state.facts?.age;
    if (intent === "gender") return !state.facts?.gender;
    if (intent === "location") return !state.facts?.location;
    return true;
  });
  const pool = missing.length ? missing : candidates;
  const fresh = pool.filter((intent) => !state.askedIntents.has(intent));
  const finalPool = fresh.length ? fresh : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)] || "age";
}

export function nextOpening(state) {
  const intent = chooseNextIntent(state);
  state.askedIntents.add(intent);
  const reply = pickLine(state.script.intents?.[intent]?.questions, state.usedLines);
  return reply ? { reply, source: "question", intent } : null;
}

export function nextGenderOpening(state) {
  const gender = state.script.persona?.gender;
  const cfg = state.script.genderOpeners;
  if (!cfg) return nextOpening(state);

  const ask = pickLine(cfg.ask, state.usedLines);
  const self = pickLine(cfg.self, state.usedLines);

  // Start with a gender-related message every time, but vary whether
  // the bot asks first or casually reveals "F" itself.
  const reply = Math.random() < 0.5 ? ask : self;
  return reply ? { reply, source: "gender_opening", intent: "gender" } : nextOpening(state);
}

export function nextReply(state, text) {
  const script = state.script;
  const intents = detectIntents(text);
  const signals = extractSignals(text);
  const learnedInfo = Object.keys(signals).length > 0;
  remember(state, signals);

  const directIntent = intents.find((intent) => script.intents?.[intent]);
  if (directIntent) {
    state.intentHistory.push(directIntent);
    const cfg = script.intents[directIntent];
    const reply = pickLine(cfg.replies, state.usedLines);
    if (reply) {
      let followUp = null;
      if (learnedInfo) {
        const opening = nextOpening(state);
        followUp = opening?.reply || null;
      }
      return { reply, source: "intent", intent: directIntent, learnedInfo, followUp };
    }
  }

  if (learnedInfo) {
    const acknowledgement = pickLine(script.acknowledgements, state.usedLines);
    const opening = nextOpening(state);
    if (acknowledgement) {
      return { reply: acknowledgement, source: "signal", learnedInfo: true, followUp: opening?.reply || null };
    }
    if (opening) return { ...opening, learnedInfo: true };
  }

  const filler = pickLine(script.fillers, state.usedLines);
  if (filler) return { reply: filler, source: "filler" };

  return nextOpening(state);
}
