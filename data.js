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
    otherReply: "I'm not sure about that one. I'm best at hangout ideas, finding a time that works for everyone and splitting costs. Try asking me about coffee, food, hikes or study spots 🙂",

    // Offline AI: used when no Claude API key is set (or the live call fails).
    // Checked top to bottom; the first match wins. Several replies rotate if
    // someone asks the same kind of thing again. Places are real, prices made up.
    // "ideas" is special: it answers with the scripted ideas card above.
    aiIntents: [
      { match: /\b(hi|hey|hello|yo|good (morning|evening))\b/i, onlyIfShort: true, replies: [
        "Hi Alex! 👋 Ask me for hangout ideas, a time that works for everyone or cheap spots near campus.",
      ] },
      { match: /thank|thx|appreciate/i, replies: [
        "Anytime! Have fun, and let me know if you want more ideas.",
        "Happy to help. The group decides, I just suggest 🙂",
      ] },
      { match: /who are you|what can you do|help\b|how does this work/i, replies: [
        "I'm the CalConnect AI. I suggest hangouts and events, find times that work for everyone and set up cost splits. I never book or pay for anything without each of you approving it.",
      ] },
      { match: /coffee|caf[eé]|latte|espresso|matcha/i, replies: [
        "Strada is the classic pick ☕ It's right by campus and the patio is great for groups. For a quieter study session, Edmonds is a nice choice.",
        "If Strada is packed, try Caffe Mediterraneum on Telegraph. It's been around forever and has plenty of seats for 4.",
      ] },
      { match: /study|library|homework|midterm|exam|focus/i, replies: [
        "Moffitt Library is open late and has group study rooms you can book 📚 Free Speech Movement Café is right next to it for snacks.",
        "For something calmer, Doe Library's reading room is beautiful. Edmonds is a good café option if you want to talk while you work.",
      ] },
      { match: /rain|indoor|board ?game|games|cozy/i, replies: [
        "Rainy day idea: Victory Point Café on Shattuck has hundreds of board games 🎲 A table for 4 is about $5 each with your group discount.",
      ] },
      { match: /food|eat|lunch|dinner|hungry|pizza|brunch|snack/i, replies: [
        "Cheese Board Pizza on Shattuck is a Berkeley classic 🍕 A whole pizza split 4 ways comes to about $7 each.",
        "Telegraph Ave has lots of cheap options close to campus. The Downtown Berkeley Farmers' Market on Saturday mornings is great for grazing together too.",
      ] },
      { match: /hike|hiking|trail|outdoor|nature|walk|run\b/i, replies: [
        "The Big C trail starts right behind Memorial Stadium and takes about an hour round trip 🥾 It's free and the view of the Bay is great.",
        "For a longer hike, Tilden Regional Park has easy loops and a little steam train. It's a short bus ride from campus.",
      ] },
      { match: /sunset|view|photo|pictures/i, replies: [
        "Indian Rock Park in North Berkeley has one of the best sunset views of the Bay 🌅 It's free and about 20 minutes from campus by bus.",
      ] },
      { match: /\bsf\b|san francisco|the city|bart/i, replies: [
        "Downtown Berkeley BART gets you to San Francisco in about 25 minutes 🚇 The Ferry Building and Dolores Park are easy, cheap picks for a group.",
      ] },
      { match: /career|network|internship|job|consult|finance|banking|resume|recruit|info session|professional/i, replies: [
        "There's a startup demo night in SoMa on Thursday, $10 each with a group ticket 💼 It's in Activity ideas if you want to vote on it. Your professional circle and mentor can help with career questions too.",
      ] },
      { match: /discount|cheap|budget|price|cost|money|save|afford|expensive/i, replies: [
        "Discounts grow with how many of you come: 3 or more get 10% off and the whole group gets 20% 💸 They unlock when you check in together at the venue.",
      ] },
      { match: /vote|book|split|pay|approve/i, replies: [
        "Open Activity ideas to vote. Once a plan wins, I set up the cost split and each of you approves your own share. Nobody ever pays for anyone else.",
      ] },
      { match: /when|what time|schedule|available|thursday|evening|morning/i, replies: [
        "You're all free Thursday evenings and Saturday mornings 🗓️ Want me to suggest something for one of those?",
      ] },
      { match: /why.*match|matched|how.*match/i, replies: [
        "You were matched on your quiz answers: shared interests, free time, budget and how close you live. Never on personal traits like gender, religion or ethnicity.",
      ] },
      { match: /privat|data|rating|who can see|anonymous/i, replies: [
        "Ratings and \"would meet again\" answers are private. Only you and CalConnect see them, and votes only show totals 🔒",
      ] },
      { match: /mentor/i, replies: [
        "You can turn on a mentor in the Mentor tab. It's a 1:1 match with an upper-year student for coffee chats, and they accept each request.",
      ] },
      { match: /idea|suggest|saturday|sunday|weekend|plans?\b|hang ?out|what (should|can|could) we do|activit|bored|fun/i, ideas: true },
    ],
    // Group members chiming in after the AI's ideas.
    reactions: [
      { from: "priya", text: "Kayaking sounds so fun 🛶" },
      { from: "jordan", text: "I'm in for either! Let's vote 😄" },
    ],
    // Short replies when Alex writes without @AI.
    smallTalk: [
      { from: "maya", text: "Haha love that 😄" },
      { from: "jordan", text: "Same!" },
      { from: "priya", text: "Agreed 🙌" },
    ],
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
