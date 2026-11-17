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

  connectOptions: [
    { id: "fun", icon: "🎉", title: "Fun group", desc: "4–5 students for hangouts. You can join professional events together too.", default: true },
    { id: "pro", icon: "💼", title: "Professional circle", desc: "A networking chat of ~8 students with similar career interests.", default: false },
    { id: "mentor", icon: "🧭", title: "Mentor", desc: "A 1:1 match with an upper-year student for coffee chats.", default: false },
  ],
};
