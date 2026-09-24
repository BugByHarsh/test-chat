const rooms = new Map();
let counter = 0;

function rid() {
  return `r_${Date.now().toString(36)}_${(++counter).toString(36)}`;
}

export function createRoom(sessionA, sessionB, mode) {
  const id = rid();
  const roleA = Math.random() < 0.5 ? "caller" : "callee";
  const roleB = roleA === "caller" ? "callee" : "caller";

  const room = {
    id,
    mode,
    startedAt: Date.now(),
    members: [
      { sessionId: sessionA.id, role: roleA, type: sessionA.type },
      { sessionId: sessionB.id, role: roleB, type: sessionB.type },
    ],
    messages: [], // ring buffer for report snapshots
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id) {
  return rooms.get(id);
}

export function deleteRoom(id) {
  rooms.delete(id);
}

export function getPartner(room, sessionId) {
  if (!room) return null;
  return room.members.find((m) => m.sessionId !== sessionId) || null;
}

export function pushRoomMessage(room, fromSessionId, text) {
  if (!room) return;
  room.messages.push({ from: fromSessionId, text, ts: Date.now() });
  if (room.messages.length > 20) room.messages.shift();
}

export function allRooms() {
  return Array.from(rooms.values());
}