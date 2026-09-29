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
      payload: { reason: "exited", roomId: room.id },
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
        payload: { reason: "exited", roomId: room.id },
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

test("manual skip leaves skipper idle and notifies partner as skipped", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-skip-a", ipHash: "a" });
  const b = createSession({ socketId: "test-skip-b", ipHash: "b" });
  const room = createRoom(a, b, "text");

  a.state = b.state = "chatting";
  a.roomId = b.roomId = room.id;
  a.searchId = "search-a";
  b.searchId = "search-b";

  const socket = fakeSocket(a.socketId, events);
  registerHandlers(io, socket);
  socket.trigger("skip", { source: "user" });

  assert.equal(a.state, "idle");
  assert.equal(a.roomId, null);
  assert.equal(b.state, "idle");
  assert.equal(b.roomId, null);
  assert.deepEqual(
    events.filter((event) => event.event === "partner_left"),
    [{
      socketId: b.socketId,
      event: "partner_left",
      payload: { reason: "skipped", roomId: room.id },
    }]
  );
  assert.deepEqual(
    events.find((event) => event.event === "skip_complete"),
    {
      socketId: a.socketId,
      event: "skip_complete",
      payload: { roomId: room.id, searchId: "search-a", source: "user" },
    }
  );

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

test("connection-failure skip bypasses the manual skip cooldown", () => {
  const events = [];
  const io = fakeIo(events);

  const a = createSession({ socketId: "test-fail-cooldown-a", ipHash: "a" });
  const b = createSession({ socketId: "test-fail-cooldown-b", ipHash: "b" });
  const room = createRoom(a, b, "voice");

  a.state = b.state = "chatting";
  a.roomId = b.roomId = room.id;
  a.searchId = "search-a";
  b.searchId = "search-b";
  a.lastSkipAt = Date.now();

  const socket = fakeSocket(a.socketId, events);
  registerHandlers(io, socket);
  socket.trigger("skip", { source: "connection_failure" });

  assert.equal(events.some((event) => event.event === "skip_complete"), true);
  assert.equal(events.some((event) => event.event === "rate_limited"), false);

  deleteSession(a.id);
  deleteSession(b.id);
});
