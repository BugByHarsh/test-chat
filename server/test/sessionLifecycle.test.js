import test from "node:test";
import assert from "node:assert/strict";

import { createSession, deleteSession } from "../src/sessions.js";
import { createRoom, getRoom } from "../src/rooms.js";
import { registerHandlers, closeRoom } from "../src/socketHandlers.js";

function fakeIo(events) {
  return {
    to(socketId) {
      return {
        emit(event, payload) {
          events.push({ socketId, event, payload });
        },
      };
    },
  };
}

function fakeSocket(id, events) {
  const handlers = new Map();

  return {
    id,
    on(event, handler) {
      handlers.set(event, handler);
    },
    emit(event, payload) {
      events.push({ socketId: id, event, payload });
    },
    trigger(event, payload) {
      handlers.get(event)?.(payload);
    },
  };
}

test("closeRoom is terminal and notifies the remaining human", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-a", ipHash: "a" });
  const b = createSession({ socketId: "test-b", ipHash: "b" });

  const room = createRoom(a, b, "video");
  a.state = "chatting";
  a.roomId = room.id;
  b.state = "chatting";
  b.roomId = room.id;

  closeRoom(io, a, "exited");

  assert.equal(a.state, "idle");
  assert.equal(a.roomId, null);
  assert.equal(a.role, null);
  assert.equal(b.state, "idle");
  assert.equal(b.roomId, null);
  assert.equal(b.role, null);
  assert.equal(getRoom(room.id), undefined);

  assert.deepEqual(events, [
    {
      socketId: "test-b",
      event: "partner_left",
      payload: { reason: "exited" },
    },
  ]);

  deleteSession(a.id);
  deleteSession(b.id);
});

test("leave_session ends an active room and is idempotent", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-leave-a", ipHash: "a" });
  const b = createSession({ socketId: "test-leave-b", ipHash: "b" });

  const room = createRoom(a, b, "text");
  a.state = "chatting";
  a.roomId = room.id;
  b.state = "chatting";
  b.roomId = room.id;

  const socket = fakeSocket(a.socketId, events);
  registerHandlers(io, socket);

  socket.trigger("leave_session");
  socket.trigger("leave_session");

  assert.equal(a.state, "idle");
  assert.equal(a.roomId, null);
  assert.equal(b.state, "idle");
  assert.equal(b.roomId, null);
  assert.equal(getRoom(room.id), undefined);

  assert.deepEqual(
    events.filter((event) => event.event === "partner_left"),
    [
      {
        socketId: "test-leave-b",
        event: "partner_left",
        payload: { reason: "exited" },
      },
    ]
  );

  deleteSession(a.id);
  deleteSession(b.id);
});

test("leave_session removes a searching user before a match can be finalized", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-search-a", ipHash: "a" });
  a.state = "searching";

  const socket = fakeSocket(a.socketId, events);
  registerHandlers(io, socket);

  socket.trigger("leave_session");

  assert.equal(a.state, "idle");
  assert.equal(a.roomId, null);
  assert.equal(events.length, 0);

  deleteSession(a.id);
});


test("matchmaker ignores a stale queue entry after a search cycle changes", async () => {
  const { findHumanMatch, addToQueue, removeFromQueue } = await import("../src/matchmaker.js");

  const a = createSession({ socketId: "test-stale-a", ipHash: "a" });
  const b = createSession({ socketId: "test-stale-b", ipHash: "b" });

  a.state = "searching";
  a.mode = "text";
  a.searchId = "current-a";
  b.state = "searching";
  b.mode = "text";
  b.searchId = "current-b";

  addToQueue(b);
  b.searchId = "new-b";

  const match = findHumanMatch(a, (id) => id === a.id ? a : id === b.id ? b : undefined);
  assert.equal(match, null);

  removeFromQueue(a.id);
  removeFromQueue(b.id);
  deleteSession(a.id);
  deleteSession(b.id);
});

test("skip_complete identifies automatic connection-failure rematches", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-fail-a", ipHash: "a" });
  const b = createSession({ socketId: "test-fail-b", ipHash: "b" });
  a.ageConfirmed = true;
  b.ageConfirmed = true;

  const room = createRoom(a, b, "voice");
  a.state = "chatting";
  a.roomId = room.id;
  a.searchId = "search-a";
  b.state = "chatting";
  b.roomId = room.id;
  b.searchId = "search-b";

  const socket = fakeSocket(a.socketId, events);
  registerHandlers(io, socket);
  socket.trigger("skip", { source: "connection_failure" });

  assert.deepEqual(
    events.find((event) => event.event === "skip_complete"),
    {
      socketId: a.socketId,
      event: "skip_complete",
      payload: {
        roomId: room.id,
        searchId: "search-a",
        source: "connection_failure",
      },
    }
  );

  deleteSession(a.id);
  deleteSession(b.id);
});
