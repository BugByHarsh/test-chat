import { config } from "../config.js";
import { SCRIPTS } from "./scripts.js";
import { createBotState, pushTimer, clearBotTimers } from "./botSession.js";
import { nextOpening, nextGenderOpening, nextReply } from "./scriptRunner.js";
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

  // No greeting/opener. Start with a random intent/question instead.
  pushTimer(
    state,
    setTimeout(() => {
      if (state.exited) return;
      const opening = nextGenderOpening(state);
      if (opening?.reply) emit(opening.reply);
    }, rand(700, 1600))
  );

  // Hard maximum lifetime. There is no exit message.
  pushTimer(state, setTimeout(() => doExit(sessionId, "exited"), state.lifetimeMs));
}

export function botOnUserMessage({ sessionId, text, emit }) {
  const state = activeBots.get(sessionId);
  if (!state || state.exited) return;

  state.userMessageCount = (state.userMessageCount || 0) + 1;

  const result = nextReply(state, text);
  if (!result) return;

  pushTimer(
    state,
    setTimeout(() => {
      if (state.exited) return;

      emit(result.reply);

      // If the user gave compact info like "F23 Delhi", keep the chat moving
      // with a different random intent instead of falling back to a fixed script.
      if (result.followUp) {
        pushTimer(
          state,
          setTimeout(() => {
            if (!state.exited) emit(result.followUp);
          }, rand(700, 1400))
        );
      }

      // Randomly leave after enough conversation. Learning age/location/gender
      // increases the chance, but there is never an exit message.
      const exitConfig = state.script.exit;
      if (state.userMessageCount >= (exitConfig?.minMessages || 2)) {
        const chance = result.learnedInfo
          ? (exitConfig?.infoChance ?? 0.2)
          : (exitConfig?.baseChance ?? 0.05);

        if (Math.random() < chance) {
          pushTimer(
            state,
            setTimeout(() => {
              if (!state.exited) doExit(sessionId, "exited");
            }, rand(900, 1800))
          );
        }
      }
    }, rand(800, 1500))
  );
}

function doExit(sessionId, reason = "exited") {
  const state = activeBots.get(sessionId);
  if (!state || state.exited) return;

  state.exited = true;

  // Intentionally no exit text. The UI only sees the normal partner-left event.
  pushTimer(
    state,
    setTimeout(() => {
      if (state.onExit) state.onExit(reason);
    }, 300)
  );
}

export function destroyBot(sessionId) {
  const state = activeBots.get(sessionId);
  if (!state) return;

  clearBotTimers(state);
  activeBots.delete(sessionId);
  deleteSession(sessionId);
}
