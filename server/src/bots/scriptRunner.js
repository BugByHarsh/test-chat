function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^\w\s?]/g, " ").replace(/\s+/g, " ").trim();
}
export function pickLine(arr, used) {
  if (!arr || !arr.length) return null;
  const fresh = arr.filter((l) => !used.has(l));
  const pool = fresh.length ? fresh : arr;
  const line = pool[Math.floor(Math.random() * pool.length)];
  used.add(line);
  return line;
}
const INTENTS = {
  greeting: ["hi","hey","hello","hii","heyy","yo","sup","wassup","what's up"],
  name: ["name","what should i call you","who are you","your name","ur name"],
  age: ["age","how old","how old r u","how old are u","your age","ur age","what age","which age",
    "are you 18","are u 18","are you 19","are u 19","are you 20","are u 20","are you 21","are u 21",
    "are you 22","are u 22","are you 23","are u 23","are you 24","are u 24","are you 25","are u 25"],
  location: ["where are you from","where are u from","where r u from","where you from","where u from",
    "from where","where from","which city","what city","city","country","which country","what country",
    "where do you live","where do u live","where r u","u from","you from","from?"],
  gender: ["m or f","male or female","boy or girl","are you a girl","are u a girl","are you female","are u female","gender"],
};
export function detectIntent(text) {
  const normalized = normalize(text);
  if (!normalized) return null;
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    if (patterns.some((p) => normalized.includes(p))) return intent;
  }
  return null;
}
export function matchKeyword(script, text) {
  const words = normalize(text).split(/\s+/);
  for (const key of Object.keys(script.keywords || {})) {
    const group = script.keywords[key];
    if (!group?.match) continue;
    if (group.match.some((kw) => words.includes(kw))) return group.say;
  }
  return null;
}
export function nextReply(state, text) {
  const script = state.script;
  const intent = detectIntent(text);
  if (intent && script.intents?.[intent]) {
    state.intentHistory ||= [];
    state.intentHistory.push(intent);
    const cfg = script.intents[intent];
    const reply = pickLine(cfg.replies, state.usedLines);
    if (reply) return { reply, source: "intent", intent, exitAfterReply: Boolean(cfg.exitAfterReply) };
  }
  const kw = matchKeyword(script, text);
  if (kw) {
    const reply = pickLine(kw, state.usedLines);
    if (reply) return { reply, source: "keyword" };
  }
  if (state.stepIndex < script.steps.length) {
    const step = script.steps[state.stepIndex++];
    state.usedLines.add(step.say);
    return { reply: step.say, source: "step" };
  }
  const filler = pickLine(script.fillers, state.usedLines);
  return filler ? { reply: filler, source: "filler" } : null;
}
