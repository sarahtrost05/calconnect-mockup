// All sample data is fake. No protected traits are asked or used for matching.
window.CC_DATA = {
  student: { name: "Alex", major: "Business (Haas)", year: "1st year" },

  // Other CalCentral checklist items, just for context on screen 1.
  // The CalConnect item itself is built in app.js.
  checklist: [
    { label: "Submit Statement of Legal Residence", done: true },
    { label: "Upload your Cal 1 Card photo", done: true },
    { label: "Finish online orientation module", done: false },
  ],

  quiz: [
    {
      q: "How would you spend a free Saturday?",
      type: "single",
      options: ["Outdoors: hikes, beach, parks", "Exploring SF and the Bay", "Chilling with a few friends", "Side projects or studying"],
    },
    {
      q: "What group size feels best?",
      type: "single",
      options: ["2–3 people", "4–5 people", "The more the merrier"],
    },
    {
      q: "When are you usually free?",
      type: "grid",
      hint: "Tap every slot that usually works for you",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      times: [
        { label: "Morning", range: "8–12" },
        { label: "Afternoon", range: "12–5" },
        { label: "Evening", range: "5–9" },
        { label: "Late", range: "9+" },
      ],
    },
    {
      q: "What do you enjoy?",
      type: "multi",
      options: ["Hiking & outdoors", "Food & cafés", "Board & video games", "Arts & music", "Sports & fitness", "Tech & building things"],
    },
    {
      q: "Which careers are you curious about?",
      type: "multi",
      options: ["Consulting", "Finance", "Tech & product", "Startups", "Nonprofit & policy", "Still exploring"],
    },
    {
      q: "What's a comfortable budget per hangout?",
      type: "single",
      options: ["Free only", "Up to $10", "Up to $25", "Flexible"],
    },
    {
      q: "How far are you happy to go?",
      type: "single",
      options: ["Walking distance", "Anywhere in Berkeley", "East Bay", "Whole Bay Area (BART)"],
    },
    {
      q: "Morning person or night owl?",
      type: "single",
      options: ["Early bird", "Somewhere in between", "Night owl"],
    },
    {
      q: "What are you hoping to find?",
      type: "multi",
      options: ["Close friends", "Study buddies", "Professional contacts", "Activity partners"],
    },
    {
      q: "How often would you like to meet up?",
      type: "single",
      options: [
        "A few times a week",
        "Once a week",
        "Every two weeks",
        "Once a month",
        "Only when something great comes up",
        "Not sure yet, let the group decide",
      ],
    },
  ],

  // Screen: Your group. "status" is the starting state for the demo:
  // accepted | pending. "willDecline" makes that member pass after Alex accepts,
  // to show that a group still works with 4.
  group: {
    name: "Thursday Trailblazers",
    members: [
      { id: "alex", name: "Alex", you: true, major: "Business (Haas)", year: "1st year", color: "#002676",
        interests: ["Hiking & outdoors", "Food & cafés", "Consulting"], status: "pending" },
      { id: "maya", name: "Maya", major: "Data Science", year: "1st year", color: "#3b7ea1",
        interests: ["Hiking & outdoors", "Board & video games", "Tech & product"], status: "accepted" },
      { id: "jordan", name: "Jordan", major: "Economics", year: "Transfer", color: "#c4820e",
        interests: ["Food & cafés", "Sports & fitness", "Consulting"], status: "accepted" },
      { id: "priya", name: "Priya", major: "Cognitive Science", year: "1st year", color: "#00897b",
        interests: ["Hiking & outdoors", "Arts & music", "Food & cafés"], status: "pending" },
      { id: "sam", name: "Sam", major: "Mechanical Engineering", year: "1st year", color: "#6a4c93",
        interests: ["Food & cafés", "Sports & fitness", "Startups"], status: "pending", willDecline: true },
    ],
    // Reasons beyond shared interests (those are counted in app.js).
    reasons: [
      { icon: "clock", title: "Same free time", text: "You're all free Thursday evenings and Saturday mornings." },
      { icon: "target", title: "Same goals", text: "Everyone is looking for close friends and activity partners." },
      { icon: "wallet", title: "Similar budget", text: "Hangouts up to $10, with group discounts on top." },
      { icon: "pin", title: "Close by", text: "All of you live within 15 minutes of campus." },
    ],
  },

  // Screen: Group chat. "from" is a member id or "ai".
  chat: {
    seed: [
      { from: "ai", time: "Today 6:02 PM", text: "Hey Alex, Maya, Jordan and Priya 👋 I'm the CalConnect AI. You were matched because you all love hiking and cafés, and you're all free Thursday evenings and Saturday mornings.\n\nQuick icebreaker: what's your favorite spot on campus so far?\n\nTag @AI anytime for ideas. I'll suggest things, you all decide." },
      { from: "maya", text: "Hi everyone! Mine is the top of the Campanile at sunset 🌅" },
      { from: "jordan", text: "Hey! Just transferred from LA. Still looking for good coffee near campus 😅 @AI any tips?" },
      { from: "ai", text: "Good question, Jordan! Try Strada ☕ It's right by campus and the patio is great for hanging out. If you want somewhere quieter to study, Edmonds is a nice pick too." },
      { from: "priya", text: "+1 for Strada, their mocha is so good" },
      { from: "priya", text: "Anyone free this weekend?" },
      { from: "maya", text: "Saturday morning works for me!" },
    ],
    suggestedPrompt: "@AI ideas for Saturday?",
    // AI reply to a question about Saturday / ideas / the weekend.
    ideasReply: {
      text: "Saturday morning works for all 4 of you 🙌 Here are 2 ideas that fit your budget:",
      ideas: [
        { title: "Farmers' market + brunch", place: "Downtown Berkeley", when: "Sat 10:00 AM", cost: "$8.50 each", deal: "15% group discount" },
        { title: "Kayaking on the Bay (Sponsored)", place: "Berkeley Marina", when: "Sat 10:00 AM", cost: "$10 each", deal: "50% off for CalConnect groups" },
      ],
      followUp: "Want me to start a vote?",
    },

    // Offline AI (ai.js): used when no Claude API key is set or the live call fails.
    // It is not a model: it spots places, topics, days, times, names and budgets
    // in a message and builds a reply from this data. Places are real, prices made up.
    ai: {
      // When everyone in the group is free (from the quiz).
      freeTimes: [{ day: "thu", time: "evening" }, { day: "sat", time: "morning" }],
      budget: 10, // per person, from the quiz

      // Simple questions with fixed answers. Checked before places and topics.
      canned: [
        { id: "greet", match: /^(hi|hey|hello|yo|good (morning|evening|afternoon))\b/i, maxWords: 4, replies: [
          "Hi Alex! 👋 Ask me for hangout ideas, a time that works for everyone or cheap spots near campus.",
          "Hey! What are you in the mood for: food, coffee, something outdoors or a study session?",
        ] },
        { id: "thanks", match: /thank|thx|appreciate/i, replies: [
          "Anytime! Have fun, and let me know if you want more ideas.",
          "Happy to help. The group decides, I just suggest 🙂",
        ] },
        { id: "yes", match: /^(yes|yeah|yep|sure|ok|okay|sounds good|let'?s do it|perfect|great)\b/i, maxWords: 4, replies: [
          "Sounds good! Check who else is in. When you're ready, the Activity ideas tab has voting and the cost split.",
          "Great. Let the group weigh in first, then you can lock it in together.",
        ] },
        { id: "about", match: /who are you|what can you do|\bhelp\b|how does (this|it) work|are you (a bot|real|human)/i, replies: [
          "I'm the CalConnect AI, not a person. I suggest hangouts and events, find times that work for everyone and set up cost splits. Nothing gets booked or paid without each of you approving it.",
        ] },
        { id: "schedule", match: /when (are|is|can) (we|everyone|you all)|are (we|you all) (all )?free|everyone free|free time|availab|schedule/i, replies: [
          "You're all free Thursday evenings and Saturday mornings 🗓️ Want me to suggest something for one of those?",
        ] },
        { id: "discount", match: /discount|deal|save money|savings/i, replies: [
          "Discounts grow with how many of you come: 3 or more get 10% off and the whole group gets 20% 💸 They unlock when you check in together at the venue.",
        ] },
        { id: "vote", match: /\bvote|book(ing)?\b|split|approve|who pays/i, replies: [
          "Open Activity ideas to vote. Once a plan wins, I set up the cost split and each of you approves your own share. Nobody ever pays for anyone else.",
        ] },
        { id: "match", match: /why.*match|how.*match|matched/i, replies: [
          "You were matched on your quiz answers: shared interests, free time, budget and how close you live. Never on personal traits like gender, religion or ethnicity.",
        ] },
        { id: "privacy", match: /privat|my data|rating|who can see|anonymous/i, replies: [
          "Ratings and \"would meet again\" answers are private. Only you and CalConnect see them, and votes only show totals 🔒",
        ] },
        { id: "mentor", match: /mentor/i, replies: [
          "You can turn on a mentor in the Mentor tab. It's a 1:1 match with an upper-year student for coffee chats, and they accept each request.",
        ] },
      ],

      // Topics: words that point to a kind of place.
      topics: [
        { id: "coffee", label: "coffee", match: /coffee|caf[eé]s?\b|latte|espresso|matcha|\btea\b/i },
        { id: "food", label: "food", match: /food|\beat\b|eating|lunch|dinner|hungry|pizza|burger|hot ?dog|snack|brunch|breakfast/i },
        { id: "study", label: "a study spot", match: /study|library|homework|midterm|exam|focus|get work done/i },
        { id: "games", label: "something indoors", match: /rain|indoor|board ?games?|\bgames?\b|cozy|chill inside/i },
        { id: "water", label: "something on the water", match: /kayak|paddle|water|beach|marina|\bbay\b/i },
        { id: "view", label: "a good view", match: /sunset|sunrise|view|photo|pictures/i },
        { id: "outdoors", label: "something outdoors", match: /hike|hiking|trail|outdoor|outside|nature|walk|picnic|\bpark\b|\brun\b|fresh air/i },
        { id: "city", label: "a trip to SF", match: /\bsf\b|san francisco|the city|\bbart\b|ferry/i },
        { id: "career", label: "a career event", match: /career|network|internship|\bjobs?\b|consult|finance|banking|resume|recruit|info session|professional|startup|founder/i },
      ],

      // Real places. cost = rough price per person (made up), times = when it's best.
      places: [
        { id: "strada", name: "Strada", aliases: /strada/i, topics: ["coffee", "study"], emoji: "☕",
          where: "right by campus on College Ave", travel: "a 5-minute walk from campus",
          blurb: "The patio is great for hanging out as a group.", cost: 5, times: ["morning", "afternoon"],
          interests: ["Food & cafés"] },
        { id: "edmonds", name: "Edmonds", aliases: /edmonds?/i, topics: ["coffee", "study"], emoji: "☕",
          where: "a calm café close to campus", travel: "about 5 minutes on foot",
          blurb: "It's quieter, so it's nice if you want to talk while you study.", cost: 5, times: ["morning", "afternoon"],
          interests: ["Food & cafés"] },
        { id: "med", name: "Caffe Mediterraneum", aliases: /mediterraneum|the med\b/i, topics: ["coffee"], emoji: "☕",
          where: "on Telegraph Ave", travel: "a 5-minute walk south of campus",
          blurb: "It's a Berkeley classic with plenty of seats for a group.", cost: 5, times: ["morning", "afternoon", "evening"],
          interests: ["Food & cafés", "Arts & music"] },
        { id: "cheeseboard", name: "Cheese Board Pizza", aliases: /cheese ?board/i, topics: ["food"], emoji: "🍕",
          where: "on Shattuck Ave", travel: "about 15 minutes on foot or a quick bus ride",
          blurb: "They make one pizza a day, and splitting a whole one works well for 4.", cost: 7, times: ["afternoon", "evening"],
          interests: ["Food & cafés"] },
        { id: "topdog", name: "Top Dog", aliases: /top ?dog/i, topics: ["food"], emoji: "🌭",
          where: "on Durant Ave", travel: "a 5-minute walk from campus",
          blurb: "It's quick, cheap and open late.", cost: 6, times: ["afternoon", "evening", "late"],
          interests: ["Food & cafés"] },
        { id: "market", name: "the Downtown Berkeley Farmers' Market", aliases: /farmers'? ?market/i, topics: ["food"], emoji: "🥕",
          where: "on Center St in Downtown Berkeley", travel: "a 10-minute walk from campus",
          blurb: "You can graze together and grab brunch nearby.", cost: 8.5, times: ["morning"], days: ["sat"],
          interests: ["Food & cafés"] },
        { id: "moffitt", name: "Moffitt Library", aliases: /moffitt/i, topics: ["study"], emoji: "📚",
          where: "in the middle of campus", travel: "on campus",
          blurb: "It's open late and has group study rooms you can book.", cost: 0, times: ["afternoon", "evening", "late"],
          interests: [] },
        { id: "doe", name: "Doe Library", aliases: /\bdoe\b|main stacks/i, topics: ["study"], emoji: "📚",
          where: "next to Memorial Glade", travel: "on campus",
          blurb: "The reading room is beautiful and very quiet.", cost: 0, times: ["morning", "afternoon"],
          interests: ["Arts & music"] },
        { id: "victory", name: "Victory Point Café", aliases: /victory point/i, topics: ["games"], emoji: "🎲",
          where: "on Shattuck Ave", travel: "about 15 minutes on foot",
          blurb: "It has hundreds of board games and tables that fit a group.", cost: 5, times: ["afternoon", "evening"],
          interests: ["Board & video games"] },
        { id: "bigc", name: "the Big C trail", aliases: /big ?c\b/i, topics: ["outdoors", "view"], emoji: "🥾",
          where: "right behind Memorial Stadium", travel: "a 10-minute walk from campus",
          blurb: "It takes about an hour round trip and the view of the Bay is great.", cost: 0, times: ["morning", "afternoon", "evening"],
          interests: ["Hiking & outdoors", "Sports & fitness"] },
        { id: "tilden", name: "Tilden Regional Park", aliases: /tilden/i, topics: ["outdoors"], emoji: "🌲",
          where: "in the Berkeley Hills", travel: "about 25 minutes by bus from campus",
          blurb: "It has easy loops, a lake and a little steam train.", cost: 0, times: ["morning", "afternoon"],
          interests: ["Hiking & outdoors"] },
        { id: "glade", name: "Memorial Glade", aliases: /memorial glade|the glade/i, topics: ["outdoors"], emoji: "🧺",
          where: "in the middle of campus", travel: "on campus",
          blurb: "It's the easiest spot for a picnic between classes.", cost: 0, times: ["afternoon"],
          interests: [] },
        { id: "indianrock", name: "Indian Rock Park", aliases: /indian rock/i, topics: ["view", "outdoors"], emoji: "🌅",
          where: "in North Berkeley", travel: "about 20 minutes by bus",
          blurb: "It has one of the best sunset views of the Bay.", cost: 0, times: ["evening"],
          interests: ["Hiking & outdoors", "Arts & music"] },
        { id: "marina", name: "the Berkeley Marina", aliases: /marina|kayak/i, topics: ["water", "outdoors"], emoji: "🛶",
          where: "on the Bay at the end of University Ave", travel: "about 20 minutes by bus",
          blurb: "Bay Paddle Co. (sponsored) runs group kayaking with gear and a short lesson.", cost: 10, times: ["morning", "afternoon"],
          interests: ["Hiking & outdoors", "Sports & fitness"] },
        { id: "ferry", name: "the Ferry Building", aliases: /ferry building/i, topics: ["city", "food"], emoji: "🚇",
          where: "in San Francisco", travel: "about 30 minutes by BART from Downtown Berkeley",
          blurb: "It's full of food stalls and right on the water.", cost: 12, times: ["morning", "afternoon"],
          interests: ["Food & cafés"] },
        { id: "dolores", name: "Dolores Park", aliases: /dolores/i, topics: ["city", "outdoors"], emoji: "🌞",
          where: "in San Francisco's Mission District", travel: "about 35 minutes by BART",
          blurb: "It's the classic spot to hang out on a sunny day.", cost: 0, times: ["afternoon"],
          interests: ["Arts & music"] },
        { id: "demo", name: "the startup demo night", aliases: /demo night/i, topics: ["career", "city"], emoji: "💼",
          where: "in SoMa, San Francisco", travel: "about 30 minutes by BART",
          blurb: "Founders pitch and you can meet them together afterwards.", cost: 10, times: ["evening"], days: ["thu"],
          interests: ["Startups", "Tech & product", "Consulting"] },
        { id: "haas", name: "the Haas career fair", aliases: /haas/i, topics: ["career"], emoji: "💼",
          where: "at the Haas School of Business", travel: "on campus",
          blurb: "Going as a group makes it much easier to start conversations.", cost: 0, times: ["afternoon"],
          interests: ["Consulting", "Finance"] },
      ],

      // When nothing matches: ask what they mean instead of a dead end.
      fallback: [
        "I'm not sure I got that. Are you looking for food, coffee, something outdoors or a study spot?",
        "Hmm, I don't know that one yet. I can help with places to go, times that work for everyone and cost splits 🙂",
      ],
    },
    // Group members chiming in after the AI's ideas.
    reactions: [
      { from: "priya", text: "Kayaking sounds so fun 🛶" },
      { from: "jordan", text: "I'm in for either! Let's vote 😄" },
    ],
    // Short replies when Alex writes without @AI.
    // How the other students reply when Alex writes without @AI (ai.js picks one).
    // {place}, {day}, {time} and {topic} are filled in from Alex's message.
    memberReplies: {
      greet: ["Hey Alex! 👋", "Hiii 😊", "Hey hey!"],
      thanks: ["Of course!", "Anytime 😊", "No problem!"],
      yes: ["Yay, let's do it! 🙌", "I'm in!", "Perfect, count me in"],
      no: ["No worries!", "All good, maybe next time", "Totally fine 😊"],
      placeFan: ["Ooh {place}! I love it there 😍", "Yes, {place} sounds great, I'm in!", "I've been wanting to go to {place}!"],
      placeNew: ["I've never been to {place}, but I'd try it!", "{place}? Sure, I'm down", "Haven't been yet, sounds fun though"],
      topic: {
        coffee: ["Coffee sounds perfect, I need it ☕", "Always down for coffee", "Yes please, I'm so tired today"],
        food: ["I'm always down for food 😋", "Yes, I'm starving", "Food is always a good idea"],
        study: ["Honestly I could use a study buddy", "Yes, I have a midterm coming up 😅", "Group study sounds good, keeps me focused"],
        games: ["Board games! I'm so in 🎲", "I love game nights", "Yes, I'm very competitive though 😄"],
        water: ["Kayaking sounds so fun 🛶", "I've never been kayaking, let's try it!", "Yes! Being on the water sounds amazing"],
        view: ["Sunsets are the best 🌅", "Yes, I want good pictures for once", "That sounds so pretty"],
        outdoors: ["Yes! I've been wanting to get outside 🌲", "I'm in, I need some fresh air", "A hike sounds great"],
        city: ["I haven't explored SF much yet, let's go!", "SF trip! I'm in", "Yes, I want to see more of the city"],
        career: ["I'd go, I want to meet more people in the field", "Networking is easier together honestly", "Count me in, I need internship tips 😅"],
      },
      dayFree: ["{day} {time} works for me!", "I'm free {day} {time} 🙌", "{day} {time} is good for me too"],
      dayBusy: ["{day} is tough for me. Maybe Thursday or Saturday?", "I'm busy {day} 😕 Thursday evening works though", "Not sure about {day}, Saturday morning is easier for me"],
      askAI: ["Ooh good question, maybe ask @AI? It's been good with ideas", "Try asking @AI, it knows a lot of spots around Berkeley", "Not sure! @AI might know"],
      question: ["Hmm, good question 🤔", "Not sure, what do you all think?", "I'd be down either way!"],
      congrats: ["Congrats!! 🎉", "Nice, you deserve a break", "Let's celebrate this weekend!"],
      funny: ["Hahaha 😂", "Lol stop 😂", "That's so funny"],
      generic: ["Haha love that 😄", "Same!", "Agreed 🙌", "So true", "Haha yes", "Honestly same", "Love this group already 😊", "Facts"],
    },
  },

  // Screen: Activity ideas. Prices are per person and made up.
  // listPrice = normal price, groupPrice = what each student pays with the group deal.
  activities: {
    ideas: [
      {
        id: "brunch", type: "social", label: "Social",
        title: "Farmers' market + brunch",
        place: "Downtown Berkeley Farmers' Market", when: "Sat 10:00 AM", duration: "~2 hrs",
        listPrice: 10, groupPrice: 8.5, deal: "15% off when 4+ of you check in",
        why: "You all like food and cafés, and you're free Saturday morning.",
      },
      {
        id: "demo", type: "pro", label: "Professional",
        title: "Startup demo night",
        place: "SoMa, San Francisco (BART from Downtown Berkeley)", when: "Thu 6:30 PM", duration: "~3 hrs",
        listPrice: 15, groupPrice: 10, deal: "Group ticket for 4+: $10 instead of $15",
        why: "Jordan and Alex are curious about consulting, Maya about tech. Meet founders together.",
      },
      {
        id: "kayak", type: "sponsored", label: "Sponsored",
        sponsor: "Bay Paddle Co.", // fictional company
        title: "Kayaking on the Bay",
        place: "Berkeley Marina", when: "Sat 10:00 AM", duration: "~2 hrs",
        listPrice: 20, groupPrice: 10, deal: "50% off for CalConnect groups",
        why: "Three of you love the outdoors. Gear and a short lesson are included.",
      },
    ],
    // Votes already in when Alex opens the screen: Alex's vote decides.
    votes: { maya: "kayak", jordan: "demo", priya: "brunch" },
  },

  connectOptions: [
    { id: "fun", icon: "🎉", title: "Fun group", desc: "4–5 students for hangouts. You can join professional events together too.", default: true },
    { id: "pro", icon: "💼", title: "Professional circle", desc: "A networking chat of ~8 students with similar career interests.", default: false },
    { id: "mentor", icon: "🧭", title: "Mentor", desc: "A 1:1 match with an upper-year student for coffee chats.", default: false },
  ],
};
