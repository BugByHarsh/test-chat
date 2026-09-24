const common = {
  greeting: { questions: [], replies: ["hey", "hii", "ohh hey", "hey :)"] },
};

export const SCRIPTS = [
  {
    id: "riya_delhi",
    tags: ["music", "movies"],
    persona: { name: "Riya", age: 21, location: "Delhi", gender: "female" },
    lifetime: [45, 90],
    exit: { minMessages: 2, baseChance: 0.05, infoChance: 0.22 },
    genderOpeners: { ask: ["m or f?", "boy or girl?", "m/f?", "you m or f?"], self: ["F", "F here", "F this side", "girl here"] },
    intents: {
      ...common,
      name: { questions: ["name?", "ur name?", "what's ur name?", "what should i call u?"], replies: ["Riya, you?", "I'm Riya, wbu?", "Riya :) you?"] },
      age: { questions: ["age?", "your age?", "how old?", "how old r u?", "what's ur age?", "u 21?"], replies: ["21, you?", "I'm 21 haha, you?", "21 :) wbu?"] },
      gender: { questions: ["m or f?", "boy or girl?", "u a girl?", "gender?", "f?"], replies: ["f haha", "girl :)", "f, you?"] },
      location: { questions: ["from?", "where u from?", "where from?", "city?", "which city?", "u from where?"], replies: ["Delhi, you?", "I'm from Delhi, wbu?", "Delhi :) you?"] },
    },
      lookingFor: {
        questions: ["what u looking for?", "here for dating or just chat?", "looking for someone?"],
        replies: ["just seeing if i click with someone", "someone around my age tbh", "just here to meet someone interesting"],
      },
      interests: {
        questions: ["what are u into?", "music?", "what do u like?", "what do u do for fun?"],
        replies: ["music mostly, wbu?", "bit of everything, you?", "gaming and music mostly, wbu?"],
      },
      work: {
        questions: ["what do u do?", "study or work?", "what are u studying?"],
        replies: ["college rn, you?", "still studying haha, wbu?", "work/study?"],
      },
    acknowledgements: ["ohh", "haha", "nicee", "oh okay", "gotcha"],
    fillers: ["ohh", "haha", "hmm", "nice"],
  },
  {
    id: "sneha_mumbai",
    tags: ["art", "anime"],
    persona: { name: "Sneha", age: 20, location: "Mumbai", gender: "female" },
    lifetime: [45, 90],
    exit: { minMessages: 2, baseChance: 0.05, infoChance: 0.22 },
    genderOpeners: { ask: ["m or f?", "boy or girl?", "m/f?", "you m or f?"], self: ["F", "F here", "F this side", "girl here"] },
    intents: {
      ...common,
      name: { questions: ["name?", "ur name?", "what's ur name?", "what do i call u?"], replies: ["Sneha, you?", "I'm Sneha :) wbu?", "Sneha haha, you?"] },
      age: { questions: ["age?", "your age?", "how old?", "how old r u?", "u 20?"], replies: ["20, wbu?", "I'm 20 haha, you?", "20 :) you?"] },
      gender: { questions: ["m or f?", "boy or girl?", "u a girl?", "f?"], replies: ["f", "girl haha", "f :) you?"] },
      location: { questions: ["from?", "where u from?", "city?", "which city?", "where from?"], replies: ["Mumbai, you?", "I'm from Mumbai :)", "Mumbai haha, wbu?"] },
    },
      lookingFor: {
        questions: ["what u looking for?", "here for dating or just chat?", "looking for someone?"],
        replies: ["just seeing if i click with someone", "someone around my age tbh", "just here to meet someone interesting"],
      },
      interests: {
        questions: ["what are u into?", "music?", "what do u like?", "what do u do for fun?"],
        replies: ["music mostly, wbu?", "bit of everything, you?", "gaming and music mostly, wbu?"],
      },
      work: {
        questions: ["what do u do?", "study or work?", "what are u studying?"],
        replies: ["college rn, you?", "still studying haha, wbu?", "work/study?"],
      },
    acknowledgements: ["ohh", "okay", "nicee", "haha", "gotcha"],
    fillers: ["ohh", "okay", "nicee", "haha"],
  },
  {
    id: "ananya_bangalore",
    tags: ["tech", "music"],
    persona: { name: "Ananya", age: 22, location: "Bangalore", gender: "female" },
    lifetime: [45, 90],
    exit: { minMessages: 2, baseChance: 0.05, infoChance: 0.22 },
    genderOpeners: { ask: ["m or f?", "boy or girl?", "m/f?", "you m or f?"], self: ["F", "F here", "F this side", "girl here"] },
    intents: {
      ...common,
      name: { questions: ["name?", "ur name?", "what's ur name?", "what should i call u?"], replies: ["Ananya, you?", "I'm Ananya :)", "Ananya haha, wbu?"] },
      age: { questions: ["age?", "your age?", "how old?", "how old r u?", "u 22?"], replies: ["22, you?", "I'm 22 haha", "22 :) wbu?"] },
      gender: { questions: ["m or f?", "boy or girl?", "u a girl?", "gender?"], replies: ["f", "girl :)", "f haha"] },
      location: { questions: ["from?", "where u from?", "city?", "which city?", "where from?"], replies: ["Bangalore, you?", "I'm from Bangalore", "Bangalore :) wbu?"] },
    },
      lookingFor: {
        questions: ["what u looking for?", "here for dating or just chat?", "looking for someone?"],
        replies: ["just seeing if i click with someone", "someone around my age tbh", "just here to meet someone interesting"],
      },
      interests: {
        questions: ["what are u into?", "music?", "what do u like?", "what do u do for fun?"],
        replies: ["music mostly, wbu?", "bit of everything, you?", "gaming and music mostly, wbu?"],
      },
      work: {
        questions: ["what do u do?", "study or work?", "what are u studying?"],
        replies: ["college rn, you?", "still studying haha, wbu?", "work/study?"],
      },
    acknowledgements: ["hmm", "ohh", "okay", "nice"],
    fillers: ["hmm", "ohh", "okay"],
  },
  {
    id: "alex_anon",
    tags: ["gaming", "memes"],
    persona: { name: "Alex", age: 21, location: "Delhi", gender: "female" },
    lifetime: [45, 90],
    exit: { minMessages: 2, baseChance: 0.05, infoChance: 0.22 },
    genderOpeners: { ask: ["m or f?", "boy or girl?", "m/f?", "you m or f?"], self: ["F", "F here", "F this side", "girl here"] },
    intents: {
      ...common,
      name: { questions: ["name?", "ur name?", "what's ur name?"], replies: ["Alex, you?", "I'm Alex :)", "Alex haha"] },
      age: { questions: ["age?", "your age?", "how old?", "u 21?"], replies: ["21, you?", "I'm 21", "21 :)"] },
      gender: { questions: ["m or f?", "boy or girl?", "u a girl?"], replies: ["f", "girl haha", "f :)"] },
      location: { questions: ["from?", "where u from?", "city?", "where from?"], replies: ["Delhi, you?", "Delhi :)"] },
    },
      lookingFor: {
        questions: ["what u looking for?", "here for dating or just chat?", "looking for someone?"],
        replies: ["just seeing if i click with someone", "someone around my age tbh", "just here to meet someone interesting"],
      },
      interests: {
        questions: ["what are u into?", "music?", "what do u like?", "what do u do for fun?"],
        replies: ["music mostly, wbu?", "bit of everything, you?", "gaming and music mostly, wbu?"],
      },
      work: {
        questions: ["what do u do?", "study or work?", "what are u studying?"],
        replies: ["college rn, you?", "still studying haha, wbu?", "work/study?"],
      },
    acknowledgements: ["hm", "oh", "okay", "nice"],
    fillers: ["hm", "oh", "okay"],
  },
  {
    id: "sam_random",
    tags: ["sports", "travel"],
    persona: { name: "Sam", age: 22, location: "Mumbai", gender: "female" },
    lifetime: [45, 90],
    exit: { minMessages: 2, baseChance: 0.05, infoChance: 0.22 },
    genderOpeners: { ask: ["m or f?", "boy or girl?", "m/f?", "you m or f?"], self: ["F", "F here", "F this side", "girl here"] },
    intents: {
      ...common,
      name: { questions: ["name?", "ur name?", "what's ur name?"], replies: ["Sam, you?", "I'm Sam :)", "Sam haha"] },
      age: { questions: ["age?", "your age?", "how old?", "u 22?"], replies: ["22, wbu?", "I'm 22", "22 :) you?"] },
      gender: { questions: ["m or f?", "boy or girl?", "u a girl?"], replies: ["f", "girl", "f :)"] },
      location: { questions: ["from?", "where u from?", "city?", "where from?"], replies: ["Mumbai, you?", "Mumbai :) wbu?"] },
    },
      lookingFor: {
        questions: ["what u looking for?", "here for dating or just chat?", "looking for someone?"],
        replies: ["just seeing if i click with someone", "someone around my age tbh", "just here to meet someone interesting"],
      },
      interests: {
        questions: ["what are u into?", "music?", "what do u like?", "what do u do for fun?"],
        replies: ["music mostly, wbu?", "bit of everything, you?", "gaming and music mostly, wbu?"],
      },
      work: {
        questions: ["what do u do?", "study or work?", "what are u studying?"],
        replies: ["college rn, you?", "still studying haha, wbu?", "work/study?"],
      },
    acknowledgements: ["hm", "ohh", "nice", "okay"],
    fillers: ["hm", "ohh", "nice"],
  },
];
