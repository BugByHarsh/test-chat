function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9?\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INTENTS = {
  greeting: [/^(hi|hii|hey|heyy|hello|yo|sup|wassup)\??$/, /^(what s up|whats up)\??$/],
  name: [
    /\b(name|ur name|your name)\b/,
    /\bwhat should i call (you|u)\b/,
    /\bwho are you\b/,
  ],
  age: [
    /\bage\b/,
    /\bhow old\b/,
    /\bhow old r u\b/,
    /\bhow old are u\b/,
    /\byour age\b/,
    /\bur age\b/,
    /\bwhat age\b/,
    /\bwhich age\b/,
    /\b(?:are|r|r u|you|u) (?:18|19|20|21|22|23|24|25|26|27|28|29|30)\b/,
  ],
  location: [
    /\bwhere (?:are|r) (?:you|u) from\b/,
    /\bwhere (?:you|u) from\b/,
    /\bfrom where\b/,
    /\bwhere from\b/,
    /\bwhich city\b/,
    /\bwhat city\b/,
    /\bcity\b/,
    /\bcountry\b/,
    /\bwhich country\b/,
    /\bwhat country\b/,
    /\bwhere do (?:you|u) live\b/,
    /\bwhere (?:are|r) (?:you|u)\b/,
    /\b(?:u|you) from\b/,
    /^from\??$/,
  ],
  gender: [
    /\bm or f\b/,
    /\bmale or female\b/,
    /\bboy or girl\b/,
    /\bare u a girl\b/,
    /\bare you a girl\b/,
    /\bare u female\b/,
    /\bare you female\b/,
    /\bgender\b/,
    /^f\??$/,
    /^m\??$/,
  ],
  lookingFor: [
    /\bwhat are (?:you|u) looking for\b/,
    /\bwhat r u looking for\b/,
    /\blooking for what\b/,
    /\bhere for what\b/,
    /\bwhy are you here\b/,
    /\bjust here for\b/,
  ],
  interests: [
    /\bwhat do you like\b/,
    /\bwhat do u like\b/,
    /\bwhat are you into\b/,
    /\bwhat r u into\b/,
    /\bhobbies?\b/,
    /\bmusic\b/,
    /\bmovies?\b/,
    /\bgames?\b/,
    /\bgaming\b/,
    /\banime\b/,
    /\bsports?\b/,
    /\btravel\b/,
  ],
  work: [
    /\bwhat do you do\b/,
    /\bwhat do u do\b/,
    /\bwork\b/,
    /\bstudy\b/,
    /\bstudying\b/,
    /\bstudent\b/,
    /\bcollege\b/,
    /\bschool\b/,
  ],
};

const AGE_RE = /(?:^|\s|[^a-z])(?:[fm]\s*)?(1[89]|[2-9]\d)(?:\s*(?:yo|y\/o|years?))?(?=\s|$|[^a-z])/i;
const GENDER_RE = /(?:^|[\s,])([fm])(?=\d|\s|$|[,?.!])/i;
const KNOWN_LOCATIONS = [
  "delhi","mumbai","bangalore","bengaluru","kolkata","chennai","hyderabad",
  "pune","jaipur","lucknow","noida","gurgaon","gurugram","chandigarh","agra",
  "kanpur","saharanpur","india","nepal","dubai","london","usa","uk"
];
const KNOWN_INTERESTS = [
  "music","movies","movie","gaming","games","game","anime","sports","sport",
  "travel","memes","football","cricket","coding","books","reading"
];

export function normalizeText(text) {
  return normalize(text);
}

export function pickLine(arr, used) {
  if (!arr || !arr.length) return null;
  const fresh = arr.filter((line) => !used.has(line));
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
    if (gender) {
      signals.gender = gender[1].toLowerCase() === "f" ? "female" : "male";
    }
  }

  const words = normalized.split(/\s+/);
  const location = KNOWN_LOCATIONS.find((place) => words.includes(place));
  if (location) signals.location = location;

  const interest = KNOWN_INTERESTS.find((item) => words.includes(item));
  if (interest) signals.interests = interest;

  if (
    /\b(relationship|dating|date|girlfriend|boyfriend|serious|friends|friendship|chat|talk|meet people|someone)\b/.test(
      normalized
    )
  ) {
    if (/\b(relationship|dating|date|girlfriend|boyfriend|serious)\b/.test(normalized)) {
      signals.lookingFor = "dating";
    } else if (/\b(friend|friendship)\b/.test(normalized)) {
      signals.lookingFor = "friends";
    } else {
      signals.lookingFor = "chat";
    }
  }

  if (/\b(student|college|school|work|job|developer|engineer|business)\b/.test(normalized)) {
    signals.work = /\b(student|college|school)\b/.test(normalized) ? "student" : "work";
  }

  if (detectIntents(normalized).includes("name") && !normalized.includes("?")) {
    const candidate = normalized
      .replace(/^(my name is|i am|im|i'm|name is)\s+/, "")
      .trim();

    if (
      candidate &&
      candidate.split(/\s+/).length <= 3 &&
      !/\d/.test(candidate) &&
      !KNOWN_LOCATIONS.includes(candidate)
    ) {
      signals.name = candidate;
    }
  }

  return signals;
}

function remember(state, signals) {
  state.facts ||= {};

  for (const [key, value] of Object.entries(signals)) {
    state.facts[key] = value;
  }
}

function updateChemistry(state, text, signals) {
  const normalized = normalize(text);
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;

  if (wordCount >= 4) state.chemistryScore = Math.min(6, state.chemistryScore + 1);
  if (normalized.includes("?") || /\b(wbu|hbu|you)\b/.test(normalized)) {
    state.chemistryScore = Math.min(6, state.chemistryScore + 1);
  }
  if (Object.keys(signals).length >= 2) {
    state.chemistryScore = Math.min(6, state.chemistryScore + 1);
  }

  if (wordCount <= 1) {
    state.shortReplyStreak += 1;
  } else {
    state.shortReplyStreak = 0;
  }
}

function factKnown(state, intent) {
  if (intent === "age") return Number.isInteger(state.facts?.age);
  if (intent === "gender") return !!state.facts?.gender;
  if (intent === "location") return !!state.facts?.location;
  if (intent === "name") return !!state.facts?.name;
  if (intent === "lookingFor") return !!state.facts?.lookingFor;
  if (intent === "interests") return !!state.facts?.interests;
  if (intent === "work") return !!state.facts?.work;
  return false;
}

function chooseNextIntent(state) {
  const candidates = Object.keys(state.script.intents || {})
    .filter((intent) => intent !== "greeting")
    .filter((intent) => !factKnown(state, intent))
    .filter((intent) => !state.askedIntents.has(intent));

  if (!candidates.length) return null;

  // Demographics first. Once those are known, move into compatibility.
  // This avoids the old name -> age -> location questionnaire feel.
  const priority =
    state.chemistryScore >= 2
      ? ["age", "location", "lookingFor", "interests", "work", "chemistry", "name", "gender"]
      : ["age", "location", "lookingFor", "interests", "work", "chemistry", "gender", "name"];

  const available = priority.filter((intent) => candidates.includes(intent));
  if (!available.length) return candidates[Math.floor(Math.random() * candidates.length)];

  const top = available.slice(0, Math.min(2, available.length));
  const intent = top[Math.floor(Math.random() * top.length)];

  // Don't hammer the same topic if it was already asked once.
  if (state.askedIntents.has(intent)) {
    const fresh = available.filter((item) => !state.askedIntents.has(item));
    if (fresh.length) return fresh[0];
  }

  return intent;
}

export function nextOpening(state) {
  const intent = chooseNextIntent(state);
  if (!intent) return null;

  state.askedIntents.add(intent);
  state.lastQuestionIntent = intent;
  const reply = pickLine(state.script.intents?.[intent]?.questions, state.usedLines);

  return reply ? { reply, source: "question", intent } : null;
}

export function nextGenderOpening(state) {
  const cfg = state.script.genderOpeners;
  if (!cfg) return nextOpening(state);

  const ask = pickLine(cfg.ask, state.usedLines);
  const self = pickLine(cfg.self, state.usedLines);
  const reply = Math.random() < 0.5 ? ask : self;

  // The opening itself establishes the bot's gender.
  state.askedIntents.add("gender");

  return reply
    ? { reply, source: "gender_opening", intent: "gender" }
    : nextOpening(state);
}

function answerDirectIntent(state, directIntent) {
  const cfg = state.script.intents?.[directIntent];
  if (!cfg) return null;

  const reply = pickLine(cfg.replies, state.usedLines);
  if (!reply) return null;

  return { reply, source: "intent", intent: directIntent };
}

export function nextReply(state, text) {
  const script = state.script;
  const intents = detectIntents(text);
  const signals = extractSignals(text);
  const learnedInfo = Object.keys(signals).length > 0;

  remember(state, signals);
  updateChemistry(state, text, signals);

  const directIntent = intents.find((intent) => script.intents?.[intent]);
  const reciprocal = /^(wbu|hbu|you\??|and you\??|what about you\??)$/.test(normalize(text));

  // "wbu?" means answer the topic the bot just asked about instead of
  // throwing a new question at the user.
  if (!directIntent && reciprocal && state.lastQuestionIntent) {
    const direct = answerDirectIntent(state, state.lastQuestionIntent);
    if (direct) return direct;
  }

  if (directIntent) {
    state.intentHistory.push(directIntent);

    // Gender is already established by the opener or the user's answer.
    // Never send another "f/f haha" response.
    if (directIntent === "gender") {
      const opening = nextOpening(state);
      return opening
        ? { ...opening, learnedInfo }
        : { reply: null, source: "intent", intent: directIntent, learnedInfo };
    }

    const direct = answerDirectIntent(state, directIntent);
    if (direct) {
      // If the user asked something and also supplied information, answer
      // them first and then naturally move to one useful next topic.
      if (learnedInfo) {
        const opening = nextOpening(state);
        direct.followUp = opening?.reply || null;
        direct.learnedInfo = true;
      }

      return direct;
    }
  }

  if (learnedInfo) {
    // Useful information gets a useful next question. No "nice", "cool",
    // "ohh", or filler acknowledgements.
    const opening = nextOpening(state);
    if (opening) return { ...opening, learnedInfo: true };
  }

  // Short low-effort replies should not cause a wall of questions.
  // Pick one relevant question and let the normal random exit logic decide.
  const opening = nextOpening(state);
  if (opening) return { ...opening, learnedInfo: false };

  return null;
}
