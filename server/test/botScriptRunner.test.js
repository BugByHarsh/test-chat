import test from "node:test";
import assert from "node:assert/strict";
import { createBotState } from "../src/bots/botSession.js";
import {
  extractSignals,
  nextGenderOpening,
  nextReply,
} from "../src/bots/scriptRunner.js";

const script = {
  persona: { gender: "female", age: 21, location: "Delhi" },
  genderOpeners: {
    ask: ["m or f?"],
    self: ["F"],
  },
  intents: {
    gender: {
      questions: ["m or f?"],
      replies: ["f"],
    },
    age: {
      questions: ["age?"],
      replies: ["21, you?"],
    },
    location: {
      questions: ["from?"],
      replies: ["Delhi, you?"],
    },
    lookingFor: {
      questions: ["what u looking for?"],
      replies: ["someone around my age"],
    },
  },
};

test("extracts compact gender, age and location together", () => {
  const signals = extractSignals("F23 Delhi");

  assert.equal(signals.gender, "female");
  assert.equal(signals.age, 23);
  assert.equal(signals.location, "delhi");
});

test("gender opener is not repeated after user answers", () => {
  const state = createBotState(script, "bot-test-1");
  const opening = nextGenderOpening(state);

  assert.ok(opening);
  assert.equal(opening.intent, "gender");

  const result = nextReply(state, "M");

  assert.ok(result);
  assert.notEqual(result.reply, "f");
  assert.notEqual(result.intent, "gender");
  assert.equal(result.reply, "age?");
});

test("wbu answers the topic the bot just asked", () => {
  const state = createBotState(script, "bot-test-2");
  nextGenderOpening(state);

  const first = nextReply(state, "M");
  assert.equal(first.reply, "age?");

  const answer = nextReply(state, "wbu?");
  assert.equal(answer.reply, "21, you?");
});
