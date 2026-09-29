import { create } from "zustand";

const uid = () => Math.random().toString(36).slice(2);

export const useChat = create((set) => ({
  connected: false,
  everConnected: false,

  status: "idle", // idle | searching | chatting | ended
  mode: "text", // text | voice | video
  interests: [],

  partnerType: null, // human | bot
  partnerTyping: false,
  roomId: null,
  role: null, // caller | callee

  messages: [],

  onlineCount: 0,
  toasts: [],
  searchNotice: null,
  reportOpen: false,

  localStream: null,
  remoteStream: null,
  mediaPermission: "prompt",
  mediaError: null,
  micOn: true,
  camOn: true,
  iceState: "new",

  // Temporary WebRTC diagnostics. Remove after call debugging is complete.
  webrtcDebug: {
    pcState: "none",
    iceState: "new",
    signalingState: "stable",
    connectionState: "new",
    role: null,
    localTracks: [],
    remoteTracks: [],
    offersSent: 0,
    offersReceived: 0,
    answersSent: 0,
    answersReceived: 0,
    iceSent: 0,
    iceReceived: 0,
    iceErrors: 0,
    lastEvent: "not started",
    lastError: "",
    updatedAt: 0,
  },

  setConnected: (v) =>
    set((s) => ({ connected: v, everConnected: s.everConnected || v })),

  setMode: (mode) => set({ mode }),

  toggleInterest: (i) =>
    set((s) => ({
      interests: s.interests.includes(i)
        ? s.interests.filter((x) => x !== i)
        : s.interests.length >= 5
          ? s.interests
          : [...s.interests, i],
    })),

  setStatus: (status) => set({ status }),
  setSearchNotice: (searchNotice) => set({ searchNotice }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
  setPartnerTyping: (partnerTyping) => set({ partnerTyping }),

  setMatched: ({ roomId, partnerType, mode, role }) =>
    set({
      status: "chatting",
      roomId,
      partnerType,
      mode,
      role,
      messages: [],
      partnerTyping: false,
    }),

  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),

  pushSystem: (text, kind = "info") =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), from: "system", text, kind, ts: Date.now() },
      ],
    })),

  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setRevealLocal: (revealLocal) => set({ revealLocal }),
  setRevealRemote: (revealRemote) => set({ revealRemote }),
  requestRevealRemote: () => set({ revealRemoteRequested: true }),
  setMediaPermission: (mediaPermission) => set({ mediaPermission }),
  setMediaError: (mediaError) => set({ mediaError }),
  setMicOn: (micOn) => set({ micOn }),
  setCamOn: (camOn) => set({ camOn }),
  setIceState: (iceState) =>
    set((s) => ({
      iceState,
      webrtcDebug: { ...s.webrtcDebug, iceState, lastEvent: `ICE: ${iceState}`, updatedAt: Date.now() },
    })),

  updateWebRTCDebug: (patch) =>
    set((s) => ({
      webrtcDebug: { ...s.webrtcDebug, ...patch, updatedAt: Date.now() },
    })),

  resetWebRTCDebug: () =>
    set({
      webrtcDebug: {
        pcState: "none",
        iceState: "new",
        signalingState: "stable",
        connectionState: "new",
        role: null,
        localTracks: [],
        remoteTracks: [],
        offersSent: 0,
        offersReceived: 0,
        answersSent: 0,
        answersReceived: 0,
        iceSent: 0,
        iceReceived: 0,
        iceErrors: 0,
        lastEvent: "not started",
        lastError: "",
        updatedAt: Date.now(),
      },
    }),

  openReport: () => set({ reportOpen: true }),
  closeReport: () => set({ reportOpen: false }),

  showToast: (text, kind = "info") =>
    set((s) => ({ toasts: [...s.toasts, { id: uid(), text, kind }] })),

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  startSearching: () =>
    set({
      status: "searching",
      messages: [],
      partnerType: null,
      partnerTyping: false,
      roomId: null,
      role: null,
      iceState: "new",
    }),
    
  resetRoom: () =>
    set({
      status: "idle",
      searchNotice: null,
      roomId: null,
      partnerType: null,
      role: null,
      messages: [],
      partnerTyping: false,
      remoteStream: null,
      iceState: "new",
    }),

  endRoom: (text = "Chat ended.") =>
    set((s) => ({
      status: "ended",
      roomId: null,
      partnerType: null,
      partnerTyping: false,
      role: null,
      revealLocal: false,
      revealRemote: false,
      revealRemoteRequested: false,
      iceState: "new",
      messages: [
        ...s.messages,
        { id: uid(), from: "system", text, ts: Date.now() },
      ],
    })),

  resetAll: () =>
    set({
      status: "idle",
      roomId: null,
      partnerType: null,
      role: null,
      messages: [],
      partnerTyping: false,
      remoteStream: null,
      revealLocal: false,
      revealRemote: false,
      revealRemoteRequested: false,
      iceState: "new",
      reportOpen: false,
    }),
}));