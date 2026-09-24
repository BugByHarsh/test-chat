export const SCRIPTS = [
  {
    id:"riya_delhi", tags:["music","movies"], persona:{name:"Riya",age:21,location:"Delhi"}, lifetime:[45,90],
    abruptExit:{afterMessages:[]}, opener:{delay:[1,3],text:"heyy"},
    steps:[{say:"what's your name?"},{say:"how old are you?"},{say:"where are you from?"}],
    intents:{
      greeting:{replies:["heyy","hii"]}, name:{replies:["I'm Riya, you?","Riya :) what's your name?"]},
      age:{replies:["21, you?","I'm 21 haha, you?"]}, gender:{replies:["girl haha","f 😭"]},
      location:{replies:["Delhi, you?","I'm from Delhi, wbu?"],exitAfterReply:true}
    }, fillers:["ohh","haha","hmm","nice"], exits:[]
  },
  {
    id:"sneha_mumbai", tags:["art","anime"], persona:{name:"Sneha",age:20,location:"Mumbai"}, lifetime:[45,90],
    abruptExit:{afterMessages:[]}, opener:{delay:[1,3],text:"hii"},
    steps:[{say:"what's your name?"},{say:"how old are you?"},{say:"where are you from?"}],
    intents:{
      greeting:{replies:["hii","hey :)"]}, name:{replies:["I'm Sneha, you?","Sneha :) what's your name?"]},
      age:{replies:["20, wbu?","I'm 20 haha, you?"]}, gender:{replies:["girl","f haha"]},
      location:{replies:["Mumbai, you?","I'm from Mumbai :)"],exitAfterReply:true}
    }, fillers:["ohh","okay","nicee","haha"], exits:[]
  },
  {
    id:"ananya_bangalore", tags:["tech","music"], persona:{name:"Ananya",age:22,location:"Bangalore"}, lifetime:[45,90],
    abruptExit:{afterMessages:[]}, opener:{delay:[1,3],text:"hello :)"},
    steps:[{say:"what's your name?"},{say:"age?"},{say:"from?"}],
    intents:{
      greeting:{replies:["hey","hello :)"]}, name:{replies:["Ananya, you?","I'm Ananya :)"]},
      age:{replies:["22, you?","I'm 22 haha"]}, gender:{replies:["f","girl :)"]},
      location:{replies:["Bangalore, you?","I'm from Bangalore"],exitAfterReply:true}
    }, fillers:["hmm","ohh","okay"], exits:[]
  },
  {
    id:"alex_anon", tags:["gaming","memes"], lifetime:[45,90], abruptExit:{afterMessages:[]}, opener:{delay:[1,3],text:"hi"},
    steps:[{say:"what's your name?"},{say:"age?"},{say:"from?"}],
    intents:{
      greeting:{replies:["hi","hey"]}, name:{replies:["I'm Alex, you?","Alex :)"]},
      age:{replies:["21, you?","I'm 21"]}, location:{replies:["Delhi, you?"],exitAfterReply:true}
    }, fillers:["hm","oh","okay"], exits:[]
  },
  {
    id:"sam_random", tags:["sports","travel"], lifetime:[45,90], abruptExit:{afterMessages:[]}, opener:{delay:[1,3],text:"hey"},
    steps:[{say:"what's your name?"},{say:"age?"},{say:"from?"}],
    intents:{
      greeting:{replies:["hey","hii"]}, name:{replies:["I'm Sam, you?","Sam :)"]},
      age:{replies:["22, wbu?","I'm 22"]}, location:{replies:["Mumbai, you?"],exitAfterReply:true}
    }, fillers:["hm","ohh","nice"], exits:[]
  }
];
