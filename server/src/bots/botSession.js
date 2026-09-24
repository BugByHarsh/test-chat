export function createBotState(script, sessionId) {
  return {
    sessionId,
    script,
    usedLines: new Set(),
    askedIntents: new Set(),
    intentHistory: [],
    facts: {},
    unmatchedCount: 0,
    nudgeCount: 0,
    nudgeTimer: null,
    userMessageCount: 0,
    lifetimeMs: 0,
    timers: [],
    exited: false,
    onExit: null,
  };
}

export function pushTimer(state, t) {
  state.timers.push(t);
}

export function clearBotTimers(state) {
  state.timers.forEach(clearTimeout);
  state.timers = [];
  if (state.nudgeTimer) {
    clearTimeout(state.nudgeTimer);
    state.nudgeTimer = null;
  }
}
