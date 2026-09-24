function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

export function pickLine(arr, used) {
  if (!arr || arr.length === 0) return null;
  const fresh = arr.filter((l) => !used.has(l));
  const pool = fresh.length ? fresh : arr;
  const line = pool[Math.floor(Math.random() * pool.length)];
  used.add(line);
  return line;
}

export function matchKeyword(script, text) {
  const words = normalize(text).split(/\s+/);
  for (const key of Object.keys(script.keywords)) {
    const group = script.keywords[key];
    if (!group.match) continue;
    for (const kw of group.match) {
      if (words.includes(kw)) return group.say;
    }
  }
  return null;
}

export function nextReply(state, text) {
  const script = state.script;

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