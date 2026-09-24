import test from "node:test";
import assert from "node:assert/strict";
import { createSession, deleteSession } from "../src/sessions.js";
import { addToQueue, queueSize, findHumanMatch, removeFromQueue } from "../src/matchmaker.js";
import { deleteRoom } from "../src/rooms.js";

function session(id) {
  return createSession({ socketId: id, ipHash: `test-${id}` });
}

test("matches two compatible users and assigns one room", () => {
  const a = session("socket-a");
  const b = session("socket-b");
  a.ageConfirmed = true;
  b.ageConfirmed = true;
  a.mode = b.mode = "text";
  a.interests = ["gaming", "music"];
  b.interests = ["gaming"];

  addToQueue(a);
  const match = findHumanMatch(b, (id) => id === a.id ? a : id === b.id ? b : undefined);

  assert.ok(match);
  assert.equal(match.room.members.length, 2);
  assert.equal(a.state, "chatting");
  assert.equal(b.state, "chatting");
  assert.equal(a.roomId, b.roomId);

  deleteRoom(match.room.id);
  deleteSession(a.id);
  deleteSession(b.id);
});

test("does not match users from different modes", () => {
  const a = session("socket-c");
  const b = session("socket-d");
  a.mode = "video";
  b.mode = "text";

  addToQueue(a);
  const match = findHumanMatch(b, (id) => id === a.id ? a : id === b.id ? b : undefined);

  assert.equal(match, null);
  assert.equal(queueSize(), 1);

  removeFromQueue(a.id);
  deleteSession(a.id);
  deleteSession(b.id);
});
