import { config } from "../config.js";
import { SCRIPTS } from "./scripts.js";
import { createBotState, pushTimer, clearBotTimers } from "./botSession.js";
import { nextReply } from "./scriptRunner.js";
import { createSession, deleteSession, botCount, humanCount } from "../sessions.js";

const activeBots = new Map();

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickScript(interests, lastScriptId) {
  const candidates = SCRIPTS.filter((s) => s.id !== lastScriptId);
  const pool = candidates.length ? candidates : SCRIPTS;
  const scored = pool.map((s) => ({
    script: s,
    score: s.tags.filter((t) => interests.includes(t)).length + Math.random() * 0.5,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].script;
}

export function canSpawnBot() {
  const humans = Math.max(1, humanCount());
  const maxBots = Math.max(1, Math.floor(humans * config.botMaxRatio));
  return botCount() < maxBots;
}

export function isBot(session) {
  return session && session.type === "bot";
}

export function getBotState(sessionId) {
  return activeBots.get(sessionId) || null;
}

export function spawnBot(ownerSession, interests) {
  if (!canSpawnBot()) return null;

  const script = pickScript(interests, ownerSession._lastBotScriptId);
  ownerSession._lastBotScriptId = script.id;

  const botSession = createSession({
    socketId: `bot:${script.id}:${Math.random().toString(36).slice(2, 8)}`,
    ipHash: "bot",
  });
  botSession.type = "bot";
  botSession.state = "chatting";

  const state = createBotState(script, botSession.id);
  state.lifetimeMs = rand(script.lifetime[0], script.lifetime[1]) * 1000;

  activeBots.set(botSession.id, state);
  return botSession;
}

export function startBot({ sessionId, emit, onExit }) {
  const state = activeBots.get(sessionId);
  if (!state) return;
  state.onExit = onExit;

  // Opener only — fired once after match, with the script's own delay.
  // This is the ONLY message the bot sends without the user prompting it.
  const [dMin, dMax] = state.script.opener.delay;
  pushTimer(
    state,
    setTimeout(() => {
      if (state.exited) return;
      emit(state.script.opener.text);
    }, rand(dMin, dMax) * 1000)
  );

  // Lifetime cap so bots don't chat forever.
  pushTimer(state, setTimeout(() => doExit(sessionId), state.lifetimeMs));
}

/**
 * The ONLY entry point for a bot reply.
 * Fires synchronously when the human's message arrives.
 * Every user message → exactly one bot reply.
 */
export function botOnUserMessage({ sessionId, text, emit }) {
  const state = activeBots.get(sessionId);
  if (!state || state.exited) return;

  const result = nextReply(state, text);
  if (!result) return;

  pushTimer(
    state,
    setTimeout(() => {
      if (state.exited) return;
      emit(result.reply);
    }, 1000)
  );
}

function doExit(sessionId) {
  const state = activeBots.get(sessionId);
  if (!state || state.exited) return;
  state.exited = true;

  const exitLine = state.script.exits[Math.floor(Math.random() * state.script.exits.length)];
  pushTimer(
    state,
    setTimeout(() => {
      if (state.onExit) state.onExit("exited", exitLine);
    }, 400)
  );
}

export function destroyBot(sessionId) {
  const state = activeBots.get(sessionId);
  if (!state) return;
  clearBotTimers(state);
  activeBots.delete(sessionId);
  deleteSession(sessionId);
}