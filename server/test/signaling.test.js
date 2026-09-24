import test from "node:test";
import assert from "node:assert/strict";
import { createSession, deleteSession } from "../src/sessions.js";
import { createRoom, deleteRoom } from "../src/rooms.js";
import { relayRTC } from "../src/signaling.js";

function setup() {
  const a = createSession({ socketId: "rtc-a", ipHash: "a" });
  const b = createSession({ socketId: "rtc-b", ipHash: "b" });
  const room = createRoom(a, b, "video");
  a.state = b.state = "chatting";
  a.roomId = b.roomId = room.id;
  return { a, b, room };
}

test("relays valid SDP only to the matched partner", () => {
  const { a, b, room } = setup();
  const emitted = [];
  const io = { to(id) { return { emit(event, payload) { emitted.push({ id, event, payload }); } }; } };

  relayRTC(io, a, "webrtc_offer", { sdp: { type: "offer", sdp: "v=0\\r\\n" } });
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].id, b.socketId);

  emitted.length = 0;
  relayRTC(io, a, "webrtc_offer", { sdp: { type: "offer", sdp: "x".repeat(100001) } });
  assert.equal(emitted.length, 0);

  deleteRoom(room.id);
  deleteSession(a.id);
  deleteSession(b.id);
});

test("rejects malformed ICE candidates", () => {
  const { a, b, room } = setup();
  const emitted = [];
  const io = { to(id) { return { emit(event, payload) { emitted.push({ id, event, payload }); } }; } };

  relayRTC(io, a, "webrtc_ice", { candidate: { candidate: 42 } });
  assert.equal(emitted.length, 0);

  relayRTC(io, a, "webrtc_ice", {
    candidate: { candidate: "candidate:1", sdpMid: "0", sdpMLineIndex: 0 },
  });
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].id, b.socketId);

  deleteRoom(room.id);
  deleteSession(a.id);
  deleteSession(b.id);
});
