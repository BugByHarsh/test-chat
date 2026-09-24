import test from "node:test";
import assert from "node:assert/strict";
import { createSession, deleteSession } from "../src/sessions.js";
import { createRoom, getRoom } from "../src/rooms.js";
import { closeRoom, canStartSearch } from "../src/socketHandlers.js";

function ioMock() {
  const events = [];
  return {
    events,
    to(socketId) {
      return { emit(event, payload) { events.push({ socketId, event, payload }); } };
    },
  };
}

test("age gate blocks search until explicitly confirmed", () => {
  const s = createSession({ socketId: "age-test", ipHash: "age" });
  assert.equal(canStartSearch(s), false);
  s.ageConfirmed = true;
  assert.equal(canStartSearch(s), true);
  deleteSession(s.id);
});

test("closing a room resets both sessions and notifies the partner", () => {
  const a = createSession({ socketId: "room-a", ipHash: "a" });
  const b = createSession({ socketId: "room-b", ipHash: "b" });
  const room = createRoom(a, b, "text");
  a.state = b.state = "chatting";
  a.roomId = b.roomId = room.id;

  const io = ioMock();
  closeRoom(io, a, "skipped");

  assert.equal(a.state, "idle");
  assert.equal(b.state, "idle");
  assert.equal(a.roomId, null);
  assert.equal(b.roomId, null);
  assert.equal(getRoom(room.id), undefined);
  assert.deepEqual(io.events[0], {
    socketId: b.socketId,
    event: "partner_left",
    payload: { reason: "skipped" },
  });

  deleteSession(a.id);
  deleteSession(b.id);
});
