export function createBotState(script, sessionId) {
  return {
    sessionId,
    script,
    stepIndex: 0,
    usedLines: new Set(),
    unmatchedCount: 0,
    nudgeCount: 0,
    nudgeTimer: null,
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