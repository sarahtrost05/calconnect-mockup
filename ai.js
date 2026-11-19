// Offline "AI" for the group chat. No API and no model: it reads a message for
// places, topics, days, times, names and budgets, then builds a reply from the
// sample data in data.js (CC_DATA.chat.ai). It remembers the last place it
// talked about, so follow-ups like "how much is it?" or "anything else?" work.
//
// Usage (app.js):  const ctx = CC_AI.newContext();
//                  CC_AI.reply("@AI pizza on Thursday?", ctx, { askedIdeas })
//                  → { text, ideas? }   (ideas: true = show the scripted ideas card)
window.CC_AI = (function () {
  const D = window.CC_DATA;
  const K = D.chat.ai;
  const members = D.group.members.filter(m => !m.willDecline); // whoever passed never shows up
  const others = members.filter(m => !m.you);

  const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  const OPENERS = ["How about", "What about", "Maybe", "Have you tried"];
  const CLOSERS = ["What do you all think?", "See who's in!", "", "You all decide, of course."];
  const INTEREST_WORDS = {
    "Hiking & outdoors": "hiking", "Food & cafés": "food and cafés", "Board & video games": "games",
    "Arts & music": "arts and music", "Sports & fitness": "sports", "Tech & product": "tech",
    "Consulting": "consulting", "Startups": "startups", "Finance": "finance",
  };

  // ---------- Reading the message ----------
  function readDay(q) {
    if (/weekend/.test(q)) return "weekend";
    if (/tonight/.test(q)) return null; // a time, not a day
    const m = q.match(/\b(monday|mon|tuesday|tues?|wednesday|wed|thursday|thurs?|thu|friday|fri|saturday|sat|sunday|sun)\b/);
    return m ? m[1].slice(0, 3) : null;
  }

  function readTime(q) {
    if (/morning|breakfast|brunch|\bam\b|early/.test(q)) return "morning";
    if (/afternoon|lunch|after class/.test(q)) return "afternoon";
    if (/evening|tonight|dinner|sunset/.test(q)) return "evening";
    if (/late|midnight/.test(q)) return "late";
    return null;
  }

  function readBudget(q) {
    const m = q.match(/\$\s?(\d+)|(\d+)\s?(dollars|bucks)/);
    if (m) return Number(m[1] || m[2]);
    if (/for free|(something|anything) free|free (stuff|things|activit\w*|ideas?|places?|options?|spots?)|no money|broke|costs? nothing/.test(q)) return 0;
    if (/cheap|budget|afford|not expensive|low cost/.test(q)) return K.budget;
    return null;
  }

  const readPlace = q => K.places.find(p => p.aliases.test(q)) || null;
  const readTopic = q => K.topics.find(t => t.match.test(q)) || null;
  const readPerson = q => others.find(m => new RegExp(`\\b${m.name}\\b`, "i").test(q)) || null;

  // What kind of follow-up question is it?
  function readAsk(q) {
    if (/how much|price|cost|expensive|pay\b/.test(q)) return "cost";
    if (/how (do|can|would) (we|i) get|how far|where is|directions|\bbus\b|walk there|how long to get/.test(q)) return "travel";
    if (/\bwhen\b|open|hours|what time|good (on|in|for)|work (on|for)/.test(q)) return "when";
    if (/another|something else|anything else|other (idea|option|place)s?|instead|\belse\b/.test(q)) return "another";
    if (/who (would|might|will)|would .* like/.test(q)) return "who";
    return null;
  }

  // ---------- Building sentences ----------
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const money = n => Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
  const costText = p => p.cost === 0 ? "free" : `about ${money(p.cost)} each`;
  const listAnd = arr => arr.length <= 1 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
  const pick = (arr, ctx) => arr[ctx.turn % arr.length];
  const interestWord = s => INTEREST_WORDS[s] || s.toLowerCase();

  function fansOf(place) {
    return others.filter(m => m.interests.some(i => place.interests.includes(i))).map(m => m.name);
  }

  // Does this day (and time) work for the whole group, and for the place?
  function dayLine(day, time, place) {
    const slots = K.freeTimes;
    const n = members.length;
    const fmtSlot = s => `${DAY_NAMES[s.day]} ${s.time}`;
    const allSlots = listAnd(slots.map(fmtSlot)).replace(" and ", " or ");

    if (day === "weekend") day = "sat";
    if (place && place.days && !place.days.includes(day)) {
      return `It only happens on ${listAnd(place.days.map(d => DAY_NAMES[d] + "s"))}, though.`;
    }
    const slot = slots.find(s => s.day === day);
    if (!slot) return `${DAY_NAMES[day]} isn't one of your shared free times. ${cap(allSlots)} work for everyone, but the group can decide.`;
    if (time && time !== slot.time) return `You're all free ${fmtSlot(slot)}, so ${DAY_NAMES[day]} ${time} might not work for everyone.`;
    let line = `${fmtSlot(slot)} works for all ${n} of you.`;
    if (place && !place.times.includes(slot.time)) line += ` It's best in the ${place.times[0]}, though.`;
    return line;
  }

  // Talk about one specific place, answering what was asked.
  function describe(place, e, ctx) {
    const out = [];
    if (e.ask === "cost") {
      out.push(`${cap(place.name)} is ${costText(place)}.`);
      if (place.cost > 0) out.push("With 3 or more of you checking in together, the group discount brings that down.");
    } else if (e.ask === "travel") {
      out.push(`${cap(place.name)} is ${place.where}, ${place.travel}.`);
    } else if (e.ask === "when" && !e.day) {
      const best = place.days ? `${listAnd(place.days.map(d => DAY_NAMES[d]))} ${place.times[0]}s` : `the ${listAnd(place.times)}`;
      out.push(`${cap(place.name)} is best in ${best}.`.replace("in Saturday", "on Saturday").replace("in Thursday", "on Thursday"));
      out.push(`You're all free ${listAnd(K.freeTimes.map(s => `${DAY_NAMES[s.day]} ${s.time}`))}.`);
    } else if (e.ask === "who") {
      const fans = fansOf(place);
      out.push(fans.length ? `${listAnd(fans)} would probably like ${place.name}, based on their interests.` : `It's a good fit for everyone, no special interests needed.`);
    } else {
      out.push(`${cap(place.name)} is ${place.where} ${place.emoji} ${place.blurb} It's ${costText(place)}.`);
      const fans = fansOf(place);
      if (fans.length && fans.length < others.length) out.push(`${listAnd(fans)} would probably love it.`);
    }
    if (e.day) out.push(dayLine(e.day, e.time, place));
    return out.join(" ");
  }

  // Suggest a place from a list of options, skipping ones already suggested.
  function suggest(options, e, ctx, intro) {
    if (!options.length) return null;
    let fresh = options.filter(p => !ctx.suggested.includes(p.id));
    if (!fresh.length) { ctx.suggested = ctx.suggested.filter(id => !options.some(p => p.id === id)); fresh = options; }
    const place = fresh[0];
    ctx.suggested.push(place.id);
    ctx.lastPlace = place;

    const out = [];
    if (intro) out.push(intro);
    out.push(`${pick(OPENERS, ctx)} ${place.name}? It's ${place.where} ${place.emoji} ${place.blurb} It's ${costText(place)}.`);
    if (e.day) out.push(dayLine(e.day, e.time, place));
    const closer = pick(CLOSERS, ctx);
    if (closer) out.push(closer);
    // At most one emoji per message.
    return keepOneEmoji(out.join(" "));
  }

  function keepOneEmoji(text) {
    let seen = false;
    return text.replace(/\s?\p{Extended_Pictographic}️?/gu, m => (seen ? "" : (seen = true, m)));
  }

  // Places that fit the topic, budget, day/time and (optionally) a person's interests.
  function candidates(e) {
    let list = K.places;
    if (e.topic) list = list.filter(p => p.topics.includes(e.topic.id));
    else list = list.filter(p => !p.topics.includes("study") && !p.topics.includes("career")); // hangouts first
    if (e.budget !== null) list = list.filter(p => p.cost <= e.budget);
    const slot = e.day && K.freeTimes.find(s => s.day === (e.day === "weekend" ? "sat" : e.day));
    const time = e.time || (slot && slot.time);
    if (time) {
      const fit = list.filter(p => p.times.includes(time) && (!p.days || !e.day || p.days.includes(e.day === "weekend" ? "sat" : e.day)));
      if (fit.length) list = fit;
    }
    if (e.person) {
      const liked = list.filter(p => p.interests.some(i => e.person.interests.includes(i)));
      if (liked.length) list = liked;
    }
    return list;
  }

  // ---------- Main ----------
  function reply(text, ctx, opts = {}) {
    ctx.turn++;
    const q = text.replace(/@ai\b/gi, "").trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean).length;

    const e = {
      place: readPlace(q), topic: readTopic(q), day: readDay(q), time: readTime(q),
      person: readPerson(q), budget: readBudget(q), ask: readAsk(q),
    };
    const specific = e.place || e.topic || e.person || e.budget !== null;

    // 1. Simple fixed answers.
    if (!e.place && !e.topic && !e.day) {
      const c = K.canned.find(it => it.match.test(q) && (!it.maxWords || words <= it.maxWords));
      if (c) {
        const n = ctx.canned[c.id] = (ctx.canned[c.id] || 0) + 1;
        return { text: c.replies[(n - 1) % c.replies.length] };
      }
    }

    // 2. First "ideas for Saturday?" gets the ideas card that links to the vote.
    const wantsIdeas = /idea|suggest|recommend|plans?\b|hang ?out|what (should|can|could) we do|activit|bored|\bfun\b|anything to do/.test(q);
    if (wantsIdeas && !specific && !opts.askedIdeas) return { ...D.chat.ideasReply, ideas: true };

    // 3. A specific place: answer about it.
    if (e.place) { ctx.lastPlace = e.place; return { text: describe(e.place, e, ctx) }; }

    // 4. Follow-up about the last place ("how much is it?", "how do we get there?").
    if (ctx.lastPlace && !e.topic && !e.person && e.ask && e.ask !== "another") {
      return { text: describe(ctx.lastPlace, e, ctx) };
    }

    // 5. "Something else?" → next place in the same topic.
    if (e.ask === "another" && !e.topic && ctx.lastPlace) {
      const topic = K.topics.find(t => t.id === ctx.lastPlace.topics[0]);
      const t = suggest(candidates({ ...e, topic }), e, ctx);
      if (t) return { text: t };
    }

    // 6. A person: suggest something they'd like.
    if (e.person && !e.topic) {
      const intro = `${e.person.name} is into ${listAnd(e.person.interests.map(interestWord))}.`;
      return { text: suggest(candidates(e), e, ctx, intro) };
    }

    // 7. A topic and/or a budget: suggest a fitting place.
    if (e.topic || e.budget !== null) {
      const options = candidates(e);
      if (!options.length && e.budget !== null) {
        const free = K.places.filter(p => p.cost === 0).slice(0, 3).map(p => p.name);
        return { text: `I don't know a ${e.topic ? e.topic.label.replace(/^(a|an|something) /, "") + " spot" : "place"} under ${money(e.budget)}, but ${listAnd(free)} are all free.` };
      }
      const intro = e.budget === 0 ? "Free it is." : e.budget !== null ? `Here's one under ${money(e.budget)} each.` : "";
      return { text: suggest(options, e, ctx, intro) };
    }

    // 8. Just a day or time ("are we free Sunday?", "what about Thursday evening?").
    if (e.day || e.time || wantsIdeas) {
      const d = e.day === "weekend" ? "sat" : e.day;
      if (d && !K.freeTimes.some(s => s.day === d)) {
        return { text: `${dayLine(e.day, e.time, null)} Want an idea for one of those instead?` };
      }
      const t = suggest(candidates(e), { ...e, day: null }, ctx);
      return { text: e.day ? `${dayLine(e.day, e.time, null)} ${t.replace(/^(How about|What about|Maybe|Have you tried)/, "For that, how about")}` : t };
    }

    // 9. Nothing matched: ask what they mean instead of a dead end.
    return { text: pick(K.fallback, ctx) };
  }

  // ---------- Other students replying (messages without @AI) ----------
  // Picks who answers (someone who'd like the place/topic if possible, not the
  // same person twice in a row) and a reply that fits what Alex wrote.
  function memberReply(text, ctx) {
    const R = D.chat.memberReplies;
    const q = text.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean).length;
    const place = readPlace(q), topic = readTopic(q), day = readDay(q), time = readTime(q);
    const isQuestion = /\?$|^(where|what|which|how|any(one)? (ideas|recs?|tips))\b/.test(q);
    const wantsRecs = /recommend|suggest|ideas?|where (should|can|could) we|any (good|nice)|know (a|any) (good|nice)/.test(q);

    let pool, fans = [];
    if (/^(hi|hey|hello|yo|hii+)\b/.test(q) && words <= 4) pool = R.greet;
    else if (/thank|thx/.test(q)) pool = R.thanks;
    else if (/^(no|nah|can'?t|i can'?t|not this time)\b/.test(q)) pool = R.no;
    else if (/^(yes|yeah|yep|sure|ok|okay|sounds good|let'?s (do it|go)|i'?m in|down)\b/.test(q) && words <= 6 && !place && !topic) pool = R.yes;
    else if (/finished|done with|passed|aced|got the (job|internship)|good news/.test(q)) pool = R.congrats;
    else if (wantsRecs && !ctx.hintedAI) { pool = R.askAI; ctx.hintedAI = true; }
    else if (day && day !== "weekend") {
      const slot = K.freeTimes.find(s => s.day === day);
      pool = (slot ? R.dayFree : R.dayBusy).map(t => t.replace("{day}", DAY_NAMES[day]).replace("{time}", slot ? (time || slot.time) : ""));
    }
    else if (day === "weekend") pool = R.dayFree.map(t => t.replace("{day}", "Saturday").replace("{time}", "morning"));
    else if (place) {
      fans = others.filter(m => m.interests.some(i => place.interests.includes(i)));
      pool = (fans.length ? R.placeFan : R.placeNew).map(t => t.replace("{place}", cap(place.name.replace(/^the /, ""))));
    }
    else if (topic) {
      fans = others.filter(m => K.places.some(p => p.topics.includes(topic.id) && m.interests.some(i => p.interests.includes(i))));
      pool = R.topic[topic.id];
    }
    else if (/haha|lol|lmao|😂|🤣/.test(q)) pool = R.funny;
    else if (isQuestion) pool = R.question;
    else pool = R.generic;

    // Who answers: a fan if there is one, never the same person twice in a row.
    const choices = (fans.length ? fans : others).filter(m => m.id !== ctx.lastMember);
    const who = (choices.length ? choices : others)[ctx.memberTurn % (choices.length || others.length)];
    ctx.lastMember = who.id;
    // Rotate through the pool so the same line doesn't come back right away.
    const key = pool[0];
    const n = ctx.memberLines[key] = (ctx.memberLines[key] || 0) + 1;
    ctx.memberTurn++;
    return { from: who.id, text: pool[(n - 1 + ctx.memberTurn) % pool.length] };
  }

  function newContext() {
    return { turn: 0, lastPlace: null, suggested: [], canned: {}, memberTurn: 0, lastMember: null, memberLines: {}, hintedAI: false };
  }

  return { reply, memberReply, newContext };
})();
