export const SCRIPTS = [
  // ---- female Indian personas ----
  {
    id: "priya_delhi",
    tags: ["music", "movies"],
    lifetime: [30, 60],
    // ALWAYS skip after 2-3 user messages
    abruptExit: { afterMessages: [2, 3] },
    opener: { delay: [1, 3], text: "hi" },
    steps: [
      { say: "m or f?" },
      { say: "age?" },
      { say: "from?" },
    ],
    keywords: {
      m: { match: ["m", "male", "boy", "guy"], say: ["oh", "ok"] },
      f: { match: ["f", "female", "girl"], say: ["oh nice", "cool"] },
      greeting: { match: ["hi", "hey", "hello"], say: ["hey", "hi"] },
      from_india: { match: ["india", "delhi", "mumbai", "bangalore"], say: ["oh nice", "cool"] },
    },
    fillers: ["hm", "ok", "oh"],
    exits: [],
  },
  {
    id: "sneha_mumbai",
    tags: ["art", "anime"],
    lifetime: [30, 60],
    abruptExit: { afterMessages: [2, 3] },
    opener: { delay: [1, 3], text: "hey" },
    steps: [
      { say: "asl?" },
      { say: "from where?" },
    ],
    keywords: {
      asl_reply: { match: ["m", "f", "male", "female"], say: ["hm ok"] },
      greeting: { match: ["hi", "hey", "hello"], say: ["hey", "hi"] },
    },
    fillers: ["ok", "hm"],
    exits: [],
  },
  {
    id: "riya_bangalore",
    tags: ["tech", "music"],
    lifetime: [30, 60],
    abruptExit: { afterMessages: [2, 3] },
    opener: { delay: [1, 3], text: "hello" },
    steps: [
      { say: "f?" },
      { say: "age?" },
    ],
    keywords: {
      f: { match: ["f", "female", "girl"], say: ["ok"] },
      m: { match: ["m", "male", "boy"], say: ["oh"] },
      greeting: { match: ["hi", "hey", "hello"], say: ["hi", "hey"] },
    },
    fillers: ["ok", "hmm"],
    exits: [],
  },

  // ---- mixed / gender-neutral personas ----
  {
    id: "alex_anon",
    tags: ["gaming", "memes"],
    lifetime: [30, 60],
    abruptExit: { afterMessages: [2, 3] },
    opener: { delay: [1, 3], text: "hi" },
    steps: [
      { say: "m or f" },
      { say: "age" },
      { say: "from" },
    ],
    keywords: {
      greeting: { match: ["hi", "hey", "hello", "yo"], say: ["hey", "hi"] },
    },
    fillers: ["ok", "hm", "oh"],
    exits: [],
  },
  {
    id: "sam_random",
    tags: ["sports", "travel"],
    lifetime: [30, 60],
    abruptExit: { afterMessages: [2, 3] },
    opener: { delay: [1, 3], text: "hey" },
    steps: [
      { say: "asl" },
      { say: "from?" },
    ],
    keywords: {
      greeting: { match: ["hi", "hey", "hello"], say: ["hey"] },
    },
    fillers: ["ok", "hm"],
    exits: [],
  },
];