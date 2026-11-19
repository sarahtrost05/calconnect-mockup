(function () {
  const DATA = window.CC_DATA;
  const SCREENS = ["onboarding", "home", "group", "chat", "activities", "mentor", "rating"];

  // Onboarding steps, in order:
  //   safari   CalCentral checklist in Safari, with a "Get the CalConnect app" item
  //   store    App Store sheet on top of Safari (GET → OPEN)
  //   splash   app launch screen
  //   welcome  what CalConnect is + "Continue with CalNet ID"
  //   intro    "Let's find your people": start quiz or skip
  //   quiz     10 questions
  //   connect  fun group / professional circle / mentor
  //   matching "Finding your people…", then Home
  //   done     onboarding finished (CalCentral item shows as ticked)

  // ---------- Demo state (in memory only; resets on reload) ----------
  const state = freshState();
  let timer = null;

  function freshState() {
    return {
      step: "safari",
      installed: false,
      qIndex: 0,
      answers: {},
      connect: new Set(DATA.connectOptions.filter(o => o.default).map(o => o.id)),
      skipped: false,
    };
  }

  const APP_ICON = `
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="15" cy="20" r="9" fill="none" stroke="#fff" stroke-width="3.2"/>
      <circle cx="25" cy="20" r="9" fill="none" stroke="#FDB515" stroke-width="3.2"/>
    </svg>`;
  const appIcon = (size = "") => `<div class="app-icon ${size}">${APP_ICON}</div>`;

  // ---------- Routing ----------
  const phone = document.querySelector(".phone");
  const screenArea = document.querySelector(".screen-area");

  function currentScreen() {
    const name = location.hash.replace("#", "");
    return SCREENS.includes(name) ? name : "onboarding";
  }

  function route() {
    const screen = currentScreen();

    document.querySelectorAll(".screen").forEach(el => {
      // The rating sheet sits on top of Home.
      const under = screen === "rating" && el.dataset.screen === "home";
      el.classList.toggle("is-active", el.dataset.screen === screen || under);
    });
    document.querySelectorAll(".demo-nav a").forEach(a => {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + screen);
    });
    document.querySelectorAll(".tab-bar a").forEach(a => {
      const tab = a.dataset.tab;
      a.classList.toggle("is-active", tab === screen || (tab === "group" && screen === "chat") || (tab === "home" && screen === "rating"));
    });
    // Like most iPhone chat apps, the chat hides the tab bar to make room for the keyboard.
    document.querySelector(".tab-bar").hidden = screen === "onboarding" || screen === "chat";
    document.getElementById("skip-notice").hidden = !state.skipped;
    screenArea.scrollTop = 0;

    overlayRoot.innerHTML = "";
    if (screen === "onboarding") renderOnboarding();
    else phone.dataset.top = "app";
    if (screen === "group") renderGroup();
    if (screen === "chat") { chatHeader(); renderChat(); }
    if (screen === "activities") renderActivities();
    if (screen === "rating") renderRating();
  }

  // ---------- Onboarding rendering ----------
  const root = document.getElementById("onboarding-root");

  const TOP = { safari: "white", store: "white", done: "white", splash: "dark", welcome: "white" };

  function renderOnboarding() {
    phone.dataset.top = TOP[state.step] || "app";
    const views = {
      safari: renderSafari, store: renderSafari, done: renderSafari,
      splash: renderSplash, welcome: renderWelcome, intro: renderIntro,
      quiz: renderQuiz, connect: renderConnect, matching: renderMatching,
    };
    views[state.step]();
  }

  function renderSafari() {
    const done = state.step === "done";
    const items = DATA.checklist.map(item => `
      <li class="${item.done ? "is-done" : ""}">
        <span class="check ${item.done ? "check--done" : ""}" aria-hidden="true">${item.done ? "✓" : ""}</span>
        <span>${item.label}</span>
      </li>`).join("");

    root.innerHTML = `
      <div class="safari">
        <div class="safari__page">
          <div class="portal-bar"><strong>CalCentral</strong><span>My Dashboard</span></div>
          <div class="onboarding__body">
            <h2>Welcome, ${DATA.student.name}!</h2>
            <p class="onboarding__sub">Your new student checklist</p>
            <ul class="checklist">
              <li class="featured">
                <div class="featured__head">
                  <span class="check ${done ? "check--done" : ""}" aria-hidden="true">${done ? "✓" : ""}</span>
                  <div>
                    <h3>Get the CalConnect app ${done ? "" : '<span class="badge-new">NEW</span>'}</h3>
                    <p>${done
                      ? "You're matched! Your group is waiting in the app."
                      : "Meet 4–5 new students who share your interests and free time, with group discounts on Berkeley and Bay Area activities."}</p>
                  </div>
                </div>
                <div class="featured__actions">
                  ${done
                    ? `<a class="btn btn--primary" href="#home">Open CalConnect</a>`
                    : `<button class="btn btn--primary" data-action="get-app">Get the app</button>
                       <p class="featured__meta">Free · iPhone and Android</p>`}
                </div>
              </li>
              ${items}
            </ul>
          </div>
        </div>
        <div class="safari__toolbar">
          <div class="safari__url"><small>AA</small>🔒 calcentral.berkeley.edu</div>
        </div>
        ${state.step === "store" ? renderStoreSheet() : ""}
      </div>`;
  }

  function renderStoreSheet() {
    return `
      <div class="sheet-backdrop" data-action="close-store">
        <div class="sheet" role="dialog" aria-label="App Store">
          <div class="sheet__grabber"></div>
          <p class="sheet__store">App Store <button data-action="close-store">Cancel</button></p>
          <div class="sheet__app">
            ${appIcon()}
            <div><h3>CalConnect</h3><p>Meet your people at Berkeley</p></div>
            <button class="sheet__get ${state.installing ? "is-loading" : ""}" data-action="install"
              aria-label="${state.installed ? "Open" : "Get"}">${state.installing ? "" : state.installed ? "OPEN" : "GET"}</button>
          </div>
          <div class="sheet__stats">
            <div><strong>4.8 ★</strong>Ratings</div>
            <div><strong>17+</strong>Age</div>
            <div><strong>Social</strong>Category</div>
          </div>
          <p class="sheet__desc">Small groups of new students, real meetups around Berkeley and the Bay, and group discounts that unlock when you show up together.</p>
        </div>
      </div>`;
  }

  function renderSplash() {
    root.innerHTML = `<div class="splash">${appIcon("app-icon--lg")}<strong>CalConnect</strong></div>`;
    clearTimeout(timer);
    timer = setTimeout(() => go("welcome"), 1300);
  }

  const ICONS = {
    group: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.8 4.5 4.5"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></svg>',
    brief: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  };

  function renderWelcome() {
    root.innerHTML = `
      <div class="welcome">
        ${appIcon("app-icon--lg")}
        <h2>Meet your people<br>at Berkeley</h2>
        <p class="welcome__sub">Less scrolling, more hanging out.</p>
        <ul class="features">
          <li>${ICONS.group}<div><strong>A small group of 4–5</strong><span>Matched on interests and free time, and you can keep meeting new people.</span></div></li>
          <li>${ICONS.tag}<div><strong>Group discounts</strong><span>Unlock deals around Berkeley and the Bay when you show up together.</span></div></li>
          <li>${ICONS.brief}<div><strong>Professional circle and mentor</strong><span>Optional: networking events and 1:1 coffee chats.</span></div></li>
        </ul>
        <div class="welcome__actions">
          <button class="btn btn--primary" data-action="signin">Continue with CalNet ID</button>
          <p class="welcome__fine">We only use your name, major and year.</p>
        </div>
      </div>`;
  }

  function renderIntro() {
    root.innerHTML = `
      <div class="quiz-intro">
        <h2>Hi ${DATA.student.name}, let's find your people</h2>
        <p>10 quick questions about what you enjoy, when you're free and what you're looking for. About 2 minutes.</p>
        <p>We never ask about or match on who you are, only what you like to do.</p>
        <div class="welcome__actions">
          <button class="btn btn--primary" data-action="start">Start quiz</button>
          <button class="btn--link" data-action="skip">Skip for now and match me on basic info</button>
        </div>
      </div>`;
  }

  function renderQuiz() {
    const total = DATA.quiz.length;
    const i = state.qIndex;
    const item = DATA.quiz[i];
    const chosen = state.answers[i] || [];
    const isMulti = item.type !== "single"; // "multi" and "grid" both allow several picks

    const options = item.type === "grid" ? renderGrid(item, chosen) : `<div class="options">${item.options.map(opt => `
      <button class="option" data-option="${opt}" aria-pressed="${chosen.includes(opt)}">${opt}</button>
    `).join("")}</div>`;

    root.innerHTML = `
      <div class="quiz">
        <div class="quiz__top">
          <button class="quiz__back" data-action="back" aria-label="Previous question">‹</button>
          <span class="quiz__count">${i + 1} of ${total}</span>
          <button class="btn--link" data-action="skip">Skip quiz</button>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i + 1}">
          <div class="progress__fill" style="width:${((i + 1) / total) * 100}%"></div>
        </div>
        <h2 class="quiz__q">${item.q}</h2>
        <p class="quiz__hint">${item.hint || (isMulti ? "Pick all that apply" : "Pick one")}</p>
        ${options}
        <div class="quiz__footer">
          ${isMulti
            ? `<button class="btn btn--primary" data-action="next" ${chosen.length ? "" : "disabled"}>${i === total - 1 ? "Finish" : "Next"}</button>`
            : ""}
        </div>
      </div>`;
  }

  // Day × time-of-day grid; each cell's value is "Mon Evening" etc.
  function renderGrid(item, chosen) {
    const head = item.times.map(t => `<th scope="col">${t.label}<small>${t.range}</small></th>`).join("");
    const rows = item.days.map(day => `
      <tr>
        <th scope="row">${day}</th>
        ${item.times.map(t => {
          const value = `${day} ${t.label}`;
          return `<td><button class="slot" data-option="${value}" aria-pressed="${chosen.includes(value)}" aria-label="${value}"></button></td>`;
        }).join("")}
      </tr>`).join("");
    return `<table class="slots"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderConnect() {
    const options = DATA.connectOptions.map(o => `
      <button class="option" data-connect="${o.id}" aria-pressed="${state.connect.has(o.id)}">
        <span class="option__icon" aria-hidden="true">${o.icon}</span>
        <span class="option__text"><strong>${o.title}</strong><small>${o.desc}</small></span>
      </button>`).join("");

    root.innerHTML = `
      <div class="connect">
        <h2>How do you want to connect?</h2>
        <p class="quiz__hint">Pick any. You can change this later.</p>
        <div class="options">${options}</div>
        <div class="quiz__footer">
          <button class="btn btn--primary" data-action="match" ${state.connect.size ? "" : "disabled"}>Find my people</button>
          <button class="btn--link" data-action="back">Back to quiz</button>
        </div>
      </div>`;
  }

  function renderMatching() {
    root.innerHTML = `
      <div class="matching" role="status">
        <div class="spinner" aria-hidden="true"></div>
        <h2>Finding your people…</h2>
        <p>${state.skipped
          ? "Matching you on basic info like your major and free time."
          : "Matching on your interests, free time and goals. Never on who you are."}</p>
      </div>`;
    clearTimeout(timer);
    timer = setTimeout(() => { state.step = "done"; location.hash = "#home"; }, 1800);
  }

  // ---------- Onboarding interactions ----------
  function go(step) {
    state.step = step;
    renderOnboarding();
    screenArea.scrollTop = 0;
  }

  root.addEventListener("click", e => {
    const btn = e.target.closest("button, [data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    // Clicking the dimmed area (not the sheet itself) closes the App Store sheet.
    if (action === "close-store") {
      if (btn.classList.contains("sheet-backdrop") && e.target !== btn) return;
      return go("safari");
    }
    if (action === "get-app") { screenArea.scrollTop = 0; return go("store"); }
    if (action === "install") return install();
    if (action === "signin") return go("intro");
    if (action === "start") { state.qIndex = 0; state.skipped = false; return go("quiz"); }
    if (action === "skip") { state.skipped = true; state.connect = new Set(["fun"]); return go("matching"); }
    if (action === "match") return go("matching");
    if (action === "next") return nextQuestion();
    if (action === "back") {
      if (state.step === "connect") { state.qIndex = DATA.quiz.length - 1; return go("quiz"); }
      if (state.qIndex === 0) return go("intro");
      state.qIndex--; return renderQuiz();
    }

    if (btn.dataset.option !== undefined) return pickOption(btn.dataset.option);

    if (btn.dataset.connect) {
      const id = btn.dataset.connect;
      state.connect.has(id) ? state.connect.delete(id) : state.connect.add(id);
      return renderConnect();
    }
  });

  // GET → spinner → OPEN → app launches
  function install() {
    if (state.installing) return;
    if (state.installed) return go("splash");
    state.installing = true;
    renderSafari();
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.installing = false;
      state.installed = true;
      if (state.step === "store") renderSafari();
    }, 1200);
  }

  function pickOption(opt) {
    const i = state.qIndex;
    const item = DATA.quiz[i];
    const chosen = state.answers[i] || [];

    if (item.type !== "single") {
      state.answers[i] = chosen.includes(opt) ? chosen.filter(o => o !== opt) : [...chosen, opt];
      return renderQuiz();
    }
    // Single choice: select, then move on automatically to keep it quick.
    state.answers[i] = [opt];
    renderQuiz();
    setTimeout(() => { if (state.step === "quiz" && state.qIndex === i) nextQuestion(); }, 250);
  }

  function nextQuestion() {
    if (state.qIndex < DATA.quiz.length - 1) { state.qIndex++; renderQuiz(); }
    else go("connect");
  }

  // ---------- Your group ----------
  const groupRoot = document.getElementById("group-root");
  const overlayRoot = document.getElementById("overlay-root");
  const G = DATA.group;
  const me = G.members.find(m => m.you);
  let group = freshGroup();

  function freshGroup() {
    return {
      statuses: Object.fromEntries(G.members.map(m => [m.id, m.status])),
      timers: [],
    };
  }

  const SMALL_ICONS = {
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14.5h2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  };
  const icon = name => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${SMALL_ICONS[name]}</svg>`;

  // How many group members share each of Alex's interests.
  function sharedInterests(members) {
    return me.interests
      .map(interest => ({ interest, count: members.filter(m => m.interests.includes(interest)).length }))
      .filter(x => x.count > 1)
      .sort((a, b) => b.count - a.count);
  }

  function renderGroup() {
    const s = group.statuses;
    // Someone who passes simply leaves the list: nobody is ever shown that a person passed.
    const visible = G.members.filter(m => m.you || s[m.id] !== "declined");
    const accepted = visible.filter(m => s[m.id] === "accepted").length;
    const someonePassed = visible.length < G.members.length;
    const othersPending = G.members.some(m => !m.you && s[m.id] === "pending");
    const myStatus = s[me.id];

    const members = visible.map(m => {
      const chip = m.you && myStatus !== "accepted" ? `<span class="status status--you">You</span>`
        : s[m.id] === "accepted" ? `<span class="status status--in">✓ In</span>`
        : `<span class="status status--pending">Pending</span>`;
      const interests = m.interests.map(i =>
        `<span class="chip ${!m.you && me.interests.includes(i) ? "chip--shared" : ""}">${i}</span>`).join("");
      return `
        <li class="member ${m.you && myStatus === "declined" ? "is-out" : ""}">
          <div class="avatar ${m.you ? "avatar--you" : ""}" style="background:${m.color}" aria-hidden="true">${m.name[0]}</div>
          <div class="member__body">
            <div class="member__top">
              <strong>${m.name}${m.you ? " (you)" : ""}</strong>${chip}
            </div>
            <p class="member__meta">${m.major} · ${m.year}</p>
            <div class="chips">${interests}</div>
          </div>
        </li>`;
    }).join("");

    const shared = sharedInterests(visible).map(x =>
      `<span class="chip chip--shared">${x.interest} · ${x.count} of you</span>`).join("");
    const reasons = G.reasons.map(r => `
      <li>${icon(r.icon)}<div><strong>${r.title}</strong><span>${r.text}</span></div></li>`).join("");

    // Bottom area changes with the state of the group.
    let footer;
    if (myStatus === "pending") {
      footer = `
        <div class="action-bar">
          <button class="btn btn--ghost" data-group="decline">Pass</button>
          <button class="btn btn--primary" data-group="accept">Join this group</button>
        </div>`;
    } else if (myStatus === "declined") {
      footer = `
        <div class="result-card">
          <h3>You passed on this group</h3>
          <p>No one in the group sees that you passed. We'll suggest a new group within 2 days, and you can always keep meeting new people.</p>
          <button class="btn btn--ghost" data-group="undo">Undo</button>
        </div>`;
    } else if (othersPending) {
      footer = `<div class="result-card result-card--waiting"><div class="spinner spinner--sm"></div><p>You're in! Waiting for the others…</p></div>`;
    } else {
      footer = `
        <div class="result-card result-card--ok">
          <h3>🎉 Your group is set: ${accepted} of you are in</h3>
          ${someonePassed ? `<p>${accepted} is plenty to start. We may suggest someone new to join you later.</p>` : ""}
          <div class="result-card__actions">
            <a class="btn btn--primary" href="#chat">Say hi in the group chat</a>
            <a class="btn btn--ghost" href="#activities">Plan a first meetup</a>
          </div>
        </div>`;
    }

    groupRoot.innerHTML = `
      <header class="app-header">
        <p class="eyebrow">Fun group · New match</p>
        <h1>${G.name}</h1>
        <div class="accept-meter" aria-label="${accepted} of ${visible.length} joined">
          ${visible.map(m => `<span class="dot dot--${s[m.id]}"></span>`).join("")}
          <span>${accepted} of ${visible.length} joined</span>
        </div>
      </header>

      <ul class="members">${members}</ul>

      <section class="card why">
        <h2>Why you were matched</h2>
        <ul class="reasons">
          <li>${icon("heart")}<div><strong>Shared interests</strong><div class="chips">${shared}</div></div></li>
          ${reasons}
        </ul>
        <p class="why__note">${icon("shield")}Matched on your quiz answers only, never on gender, ethnicity, religion or other personal traits.</p>
      </section>

      ${footer}`;
  }

  function finishGroupTimers() {
    // Leaving mid-animation: jump straight to the final state.
    if (!group.timers.length) return;
    group.timers.forEach(clearTimeout);
    group.timers = [];
    G.members.forEach(m => {
      if (!m.you && group.statuses[m.id] === "pending") group.statuses[m.id] = m.willDecline ? "declined" : "accepted";
    });
  }

  function acceptGroup() {
    group.statuses[me.id] = "accepted";
    renderGroup();
    // The remaining members answer one by one.
    const pending = G.members.filter(m => !m.you && group.statuses[m.id] === "pending");
    pending.forEach((m, i) => {
      group.timers.push(setTimeout(() => {
        group.statuses[m.id] = m.willDecline ? "declined" : "accepted";
        if (i === pending.length - 1) group.timers = [];
        renderGroup();
      }, 900 * (i + 1)));
    });
  }

  function showDeclineSheet() {
    overlayRoot.innerHTML = `
      <div class="sheet-backdrop" data-group="cancel">
        <div class="action-sheet" role="dialog" aria-label="Pass on this group?">
          <div class="action-sheet__group">
            <div class="action-sheet__title">
              <strong>Pass on this group?</strong>
              <span>No one in the group will see that you passed. We'll suggest a new group within 2 days.</span>
            </div>
            <button class="action-sheet__btn action-sheet__btn--danger" data-group="confirm-decline">Pass on this group</button>
          </div>
          <button class="action-sheet__btn action-sheet__btn--cancel" data-group="cancel">Cancel</button>
        </div>
      </div>`;
  }

  function onGroupClick(e) {
    const el = e.target.closest("[data-group]");
    if (!el) return;
    const action = el.dataset.group;
    if (action === "cancel") {
      if (el.classList.contains("sheet-backdrop") && e.target !== el) return;
      overlayRoot.innerHTML = "";
    }
    if (action === "accept") acceptGroup();
    if (action === "decline") showDeclineSheet();
    if (action === "confirm-decline") {
      overlayRoot.innerHTML = "";
      group.statuses[me.id] = "declined";
      renderGroup();
    }
    if (action === "undo") { group.statuses[me.id] = "pending"; renderGroup(); }
  }
  groupRoot.addEventListener("click", onGroupClick);
  overlayRoot.addEventListener("click", onGroupClick);

  // ---------- Group chat ----------
  const C = DATA.chat;
  const chatEls = {
    messages: document.getElementById("chat-messages"),
    form: document.getElementById("composer"),
    input: document.getElementById("composer-input"),
    chip: document.getElementById("prompt-chip"),
  };
  // In the demo, the member who passes never shows up in the chat.
  const chatMembers = G.members.filter(m => !m.willDecline);
  const memberById = Object.fromEntries(G.members.map(m => [m.id, m]));
  let chat = freshChat();

  function freshChat() {
    return { messages: C.seed.map(m => ({ ...m })), pending: [], typing: null, timers: [], askedIdeas: false, waiting: 0, ai: CC_AI.newContext() };
  }

  const escapeHtml = str => str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Show "@AI" mentions in bold, keep line breaks.
  const formatText = str => escapeHtml(str).replace(/@AI\b/gi, '<strong class="mention">@AI</strong>').replace(/\n/g, "<br>");

  function chatHeader() {
    document.getElementById("chat-name").textContent = G.name;
    document.getElementById("chat-sub").textContent = `${chatMembers.length} members + CalConnect AI`;
    document.getElementById("chat-avatars").innerHTML = chatMembers.map(m =>
      `<span class="avatar avatar--xs" style="background:${m.color}">${m.name[0]}</span>`).join("");
  }

  function senderBlock(msg) {
    if (msg.from === "ai") {
      return `<div class="msg__sender">CalConnect AI <span class="ai-badge">AI</span></div>`;
    }
    return `<div class="msg__sender">${memberById[msg.from].name}</div>`;
  }

  function avatarFor(from) {
    if (from === "ai") return `<div class="app-icon app-icon--xs" aria-hidden="true">${APP_ICON}</div>`;
    const m = memberById[from];
    return `<div class="avatar avatar--sm" style="background:${m.color}" aria-hidden="true">${m.name[0]}</div>`;
  }

  function ideasCard(ideas) {
    return `
      <div class="ideas">
        ${ideas.map((idea, i) => `
          <div class="idea">
            <span class="idea__num">${i + 1}</span>
            <div>
              <strong>${idea.title}</strong>
              <span>${idea.place} · ${idea.when}</span>
              <span>${idea.cost}${idea.deal ? ` · <em class="deal">${idea.deal}</em>` : ""}</span>
            </div>
          </div>`).join("")}
        <a class="btn btn--gold btn--sm" href="#activities">See ideas and vote</a>
      </div>`;
  }

  function renderChat() {
    const list = [...chat.messages];
    const typer = chat.typing || (chat.waiting ? "ai" : null);
    if (typer) list.push({ from: typer, typing: true });

    chatEls.messages.innerHTML = list.map((msg, i) => {
      const prev = list[i - 1];
      const next = list[i + 1];
      const firstInRun = !prev || prev.from !== msg.from || msg.time;
      const lastInRun = !next || next.from !== msg.from || next.time;
      const mine = memberById[msg.from] && memberById[msg.from].you;
      const kind = msg.from === "ai" ? "ai" : mine ? "me" : "them";

      const body = msg.typing
        ? `<div class="bubble bubble--typing" aria-label="typing"><span></span><span></span><span></span></div>`
        : `<div class="bubble">${formatText(msg.text)}${msg.ideas ? ideasCard(msg.ideas) : ""}${msg.followUp ? `<p class="bubble__follow">${msg.followUp}</p>` : ""}</div>`;

      return `
        ${msg.time ? `<div class="msg-time">${msg.time}</div>` : ""}
        <div class="msg msg--${kind} ${firstInRun ? "is-first" : ""} ${lastInRun ? "is-last" : ""}">
          ${kind !== "me" ? `<div class="msg__avatar">${lastInRun ? avatarFor(msg.from) : ""}</div>` : ""}
          <div class="msg__col">
            ${kind !== "me" && firstInRun ? senderBlock(msg) : ""}
            ${body}
          </div>
        </div>`;
    }).join("");

    chatEls.chip.textContent = C.suggestedPrompt;
    chatEls.chip.hidden = chat.askedIdeas;
    chatEls.messages.scrollTop = chatEls.messages.scrollHeight;
  }

  // Someone "types" for a moment, then their message appears.
  function queueMessage(msg, delay) {
    chat.pending.push(msg);
    chat.timers.push(setTimeout(() => { chat.typing = msg.from; renderChat(); }, delay));
    chat.timers.push(setTimeout(() => {
      chat.typing = null;
      chat.messages.push(chat.pending.shift());
      renderChat();
    }, delay + (msg.from === "ai" ? 1400 : 1000)));
    return delay + (msg.from === "ai" ? 1400 : 1000);
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;
    chat.messages.push({ from: me.id, text });
    chatEls.input.value = "";
    renderChat();

    if (/@ai\b/i.test(text)) {
      aiRespond(text);
    } else {
      // Another student answers, based on what Alex wrote (ai.js).
      queueMessage(CC_AI.memberReply(text, chat.ai), 500);
    }
  }

  // ---------- The AI's answers ----------
  // Live mode: Claude answers, if the presenter saved their own API key (demo nav).
  // Otherwise (or if the call fails) the offline AI in ai.js answers.
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function aiRespond(text) {
    const c = chat;
    // The offline answer is always worked out: it is the fallback, and it tells
    // us whether this was an "ideas" question (which shows the ideas card).
    const offline = CC_AI.reply(text, c.ai, { askedIdeas: c.askedIdeas });
    const isIdeas = !!offline.ideas;
    c.waiting++;
    renderChat();
    const started = Date.now();

    let reply = null;
    if (liveAI.key()) {
      try {
        const answer = await askClaude(c.messages);
        reply = { text: answer };
        if (isIdeas) reply.ideas = C.ideasReply.ideas;
        liveAI.setStatus("on");
      } catch (err) {
        console.warn("Live AI failed, using offline replies:", err.message);
        liveAI.setStatus("error", err.message);
      }
    }
    if (!reply) reply = { text: offline.text, ideas: offline.ideas ? C.ideasReply.ideas : undefined, followUp: offline.followUp };

    await wait(Math.max(0, 1100 - (Date.now() - started))); // feels like typing
    if (c !== chat) return; // demo was restarted meanwhile
    c.waiting--;
    c.messages.push({ from: "ai", ...reply });
    if (isIdeas && !c.askedIdeas) {
      c.askedIdeas = true;
      let t = 0;
      C.reactions.forEach(r => { t = queueMessage({ ...r }, t + 500); });
    }
    renderChat();
  }

  // Everything Claude needs to answer as the CalConnect AI. Built from the sample data.
  function systemPrompt() {
    const members = chatMembers.map(m =>
      `- ${m.name}${m.you ? " (the student using the app)" : ""}: ${m.major}, ${m.year}. Interests: ${m.interests.join(", ")}`).join("\n");
    const ideas = A.ideas.map(i =>
      `- ${i.title}${i.type === "sponsored" ? ` (Sponsored by ${i.sponsor})` : ""}: ${i.place}, ${i.when}, ${money2(i.groupPrice)} each instead of ${money2(i.listPrice)} (${i.deal})`).join("\n");
    return `You are the CalConnect AI inside a group chat in CalConnect, an app that matches new UC Berkeley students into small groups and suggests real-life meetups with group discounts. This is a class-project demo with fake students.

Group: "${G.name}" (fun group, ${chatMembers.length} members)
${members}
Why they were matched: ${G.reasons.map(r => r.text).join(" ")}

Activity ideas already in the app (students vote on them in the Activity ideas tab):
${ideas}

Discounts: they grow with how many members come (3+ people = 10%, whole group = 20%) and unlock when the group checks in together at the venue.

How to reply:
- Write like a friendly, warm assistant, not slangy. Normal capitalization, short sentences, at most one emoji per message. No slang like "fr", "lol" or "bc".
- Keep it short: 1 to 3 sentences, under 60 words. Plain text only, no markdown, no lists.
- Only suggest real places in Berkeley or the Bay Area. For coffee, recommend Strada or Edmonds. Prices you mention are estimates.
- If you mention the sponsored activity, say it is sponsored.
- You suggest, the group decides. Never claim you booked, paid or committed anyone to anything; each student approves their own share in the app.
- Never use or guess race, religion, gender, sexuality, disability, nationality or other protected traits.
- Never reveal ratings, "would meet again" answers, who voted for what, or that anyone passed on the group.
- Push toward meeting in person, not spending more time in the app.
- If asked something unrelated to hanging out, studying, campus life or careers, answer briefly if harmless, otherwise steer back politely.`;
  }

  async function askClaude(messages) {
    const name = from => from === "ai" ? "CalConnect AI" : memberById[from].name;
    const transcript = messages.map(m => `${name(m.from)}: ${m.text}`).join("\n");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": liveAI.key(),
        "anthropic-version": "2026-10-21",
        "anthropic-beta": "server-side-fallback-2026-07-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-opus-5-5",
        max_tokens: 2000,
        output_config: { effort: "low" },
        fallbacks: "default", // retry on another model if a request is declined
        system: systemPrompt(),
        messages: [{
          role: "user",
          content: `Group chat so far:\n\n${transcript}\n\nWrite the CalConnect AI's next message, replying to ${me.name}'s latest message. Reply with the message text only.`,
        }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || `HTTP ${res.status}`);
    if (data.stop_reason === "refusal") throw new Error("Request declined");
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    if (!text) throw new Error("Empty reply");
    // Plain text only: drop any markdown bold/italics the model adds.
    return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^CalConnect AI:\s*/i, "");
  }

  // Tapping the suggestion "types" it into the box, like a student would.
  function typeSuggestion() {
    const text = C.suggestedPrompt;
    chatEls.input.value = "";
    chatEls.input.focus();
    [...text].forEach((ch, i) => {
      chat.timers.push(setTimeout(() => { chatEls.input.value += ch; }, 35 * i));
    });
  }

  function finishChatTimers() {
    // Leaving mid-conversation: post any replies still on their way right away.
    chat.timers.forEach(clearTimeout);
    chat.timers = [];
    chat.typing = null; // a live AI reply still on its way keeps its "typing" dots
    chat.messages.push(...chat.pending);
    chat.pending = [];
  }

  chatEls.form.addEventListener("submit", e => { e.preventDefault(); sendMessage(chatEls.input.value); });
  chatEls.chip.addEventListener("click", typeSuggestion);

  // ---------- Activity ideas: vote → booking → everyone approves their share ----------
  const A = DATA.activities;
  const actRoot = document.getElementById("activities-root");
  const ideaById = Object.fromEntries(A.ideas.map(i => [i.id, i]));
  let act = freshActivities();

  function freshActivities() {
    return {
      myVote: null,
      phase: "vote", // vote | winner | booking | booked
      // Maya has already approved; the others approve after Alex.
      approvals: Object.fromEntries(chatMembers.map(m => [m.id, m.id === "maya"])),
      timers: [],
    };
  }

  const money = n => Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
  const money2 = n => `$${n.toFixed(2)}`;
  const avatarXs = m => `<span class="avatar avatar--xs" style="background:${m.color}" title="${m.name}">${m.name[0]}</span>`;

  function allVotes() {
    const votes = { ...A.votes };
    if (act.myVote) votes[me.id] = act.myVote;
    return votes;
  }

  function winnerId() {
    const votes = allVotes();
    const counts = {};
    Object.values(votes).forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    const max = Math.max(...Object.values(counts));
    const top = Object.keys(counts).filter(id => counts[id] === max);
    return top.includes(act.myVote) ? act.myVote : top[0]; // ties go to Alex's pick
  }

  function ideaCard(idea) {
    const votes = allVotes();
    const count = Object.values(votes).filter(id => id === idea.id).length; // anonymous: counts only
    const isMine = act.myVote === idea.id;
    const isWinner = act.phase === "winner" && winnerId() === idea.id;
    const dim = act.phase === "winner" && !isWinner;

    const tag = idea.type === "sponsored"
      ? `<span class="sponsored-label">Sponsored · ${idea.sponsor}</span>`
      : `<span class="type-tag type-tag--${idea.type}">${idea.label}</span>`;

    return `
      <article class="idea-card ${idea.type === "sponsored" ? "idea-card--sponsored" : ""} ${isWinner ? "is-winner" : ""} ${dim ? "is-dim" : ""}">
        ${isWinner ? `<span class="winner-ribbon">Winner</span>` : ""}
        <div class="idea-card__top">${tag}</div>
        <h2>${idea.title}</h2>
        <p class="idea-card__meta">${icon("pin")}${idea.place}</p>
        <p class="idea-card__meta">${icon("clock")}${idea.when} · ${idea.duration}</p>
        <div class="price">
          <span class="price__now">${money(idea.groupPrice)}</span><span class="price__each">each</span>
          <s class="price__was">${money(idea.listPrice)}</s>
          <span class="deal-badge">${idea.deal}</span>
        </div>
        <p class="idea-card__why"><span class="ai-badge">AI</span>${idea.why}</p>
        ${idea.type === "sponsored" ? `<p class="idea-card__disclosure">${idea.sponsor} pays to be shown here and funds this discount. It never affects your matches.</p>` : ""}
        <div class="vote-row">
          <span class="vote-count">${count} vote${count === 1 ? "" : "s"}</span>
          ${act.myVote
            ? (isMine ? `<span class="status status--in">✓ Your vote</span>` : "")
            : `<button class="btn btn--primary btn--sm vote-btn" data-act="vote" data-id="${idea.id}">Vote</button>`}
        </div>
      </article>`;
  }

  // Shows which group you're voting / booking for.
  function groupBar() {
    return `
      <div class="group-bar">
        <div class="avatar-stack" aria-hidden="true">${chatMembers.map(avatarXs).join("")}</div>
        <div class="group-bar__text"><strong>${G.name}</strong><span>Fun group · ${chatMembers.length} members</span></div>
      </div>`;
  }

  function renderVote() {
    const voted = Object.keys(allVotes()).length;
    const w = act.phase === "winner" ? ideaById[winnerId()] : null;
    const wVotes = w ? Object.values(allVotes()).filter(id => id === w.id).length : 0;

    actRoot.innerHTML = `
      <header class="app-header">
        <h1>Activity ideas</h1>
        <p class="app-header__sub">Picked by CalConnect AI for your free time and budget.</p>
      </header>
      ${groupBar()}
      <p class="vote-status">${voted < chatMembers.length
        ? `${voted} of ${chatMembers.length} voted · <strong>your vote decides</strong>`
        : `All ${chatMembers.length} voted`}</p>
      <p class="vote-anon">${icon("shield")}Votes are anonymous. Only the totals are shown.</p>
      ${w ? `
        <div class="winner-banner">
          <p>🎉 <strong>${w.title}</strong> wins with ${wVotes} votes</p>
          <button class="btn btn--gold" data-act="book">Set up the booking</button>
        </div>` : ""}
      <div class="idea-list">${A.ideas.map(ideaCard).join("")}</div>`;
  }

  function renderBooking() {
    const idea = ideaById[winnerId()];
    const n = chatMembers.length;
    const regular = idea.listPrice * n;
    const total = idea.groupPrice * n;
    const booked = act.phase === "booked";
    const approvedCount = chatMembers.filter(m => act.approvals[m.id]).length;

    const rows = chatMembers.map(m => {
      const ok = act.approvals[m.id];
      let right;
      if (m.you && !ok) right = `<button class="btn btn--primary btn--sm" data-act="approve">Approve ${money2(idea.groupPrice)}</button>`;
      else if (ok) right = `<span class="status status--in">✓ Approved</span>`;
      else right = `<span class="status status--pending">Waiting…</span>`;
      return `
        <li class="approval">
          <div class="avatar avatar--sm" style="background:${m.color}" aria-hidden="true">${m.name[0]}</div>
          <div class="approval__who"><strong>${m.name}${m.you ? " (you)" : ""}</strong><span>${money2(idea.groupPrice)} share</span></div>
          ${right}
        </li>`;
    }).join("");

    actRoot.innerHTML = `
      <header class="app-header">
        <h1>${booked ? "Booked!" : "Booking"}</h1>
      </header>
      ${groupBar()}

      <section class="card booking-summary ${booked ? "is-booked" : ""}">
        ${idea.type === "sponsored"
          ? `<span class="sponsored-label">Sponsored · ${idea.sponsor}</span>`
          : `<span class="type-tag type-tag--${idea.type}">${idea.label}</span>`}
        <h2>${idea.title}</h2>
        <p class="idea-card__meta">${icon("pin")}${idea.place}</p>
        <p class="idea-card__meta">${icon("clock")}${idea.when} · ${idea.duration}</p>
      </section>

      <section class="card split">
        <h3>Cost split</h3>
        <div class="split__row"><span>Regular price (${n} × ${money2(idea.listPrice)})</span><span>${money2(regular)}</span></div>
        <div class="split__row split__row--deal"><span>Group discount</span><span>−${money2(regular - total)}</span></div>
        <div class="split__row split__row--total"><span>Total</span><span>${money2(total)}</span></div>
        <div class="split__each"><span>Each person pays</span><strong>${money2(idea.groupPrice)}</strong></div>
      </section>

      <section class="card">
        <div class="approvals__head">
          <h3>Everyone approves their own share</h3>
          <span>${approvedCount}/${n}</span>
        </div>
        <ul class="approvals">${rows}</ul>
        <p class="fine-print">${icon("shield")}No one is charged until they approve. You never pay for anyone else.</p>
      </section>

      <p class="checkin-note">🎟️ The group discount unlocks when 4+ of you check in together at the venue.</p>

      ${booked ? `
        <div class="result-card result-card--ok">
          <h3>You're all set for ${idea.when}</h3>
          <p>All ${n} approved. CalConnect AI posted the details in your group chat.</p>
          <div class="result-card__actions">
            <a class="btn btn--primary" href="#chat">Open group chat</a>
            <button class="btn btn--ghost" data-act="after">Fast-forward to after the meetup</button>
          </div>
        </div>` : ""}`;
  }

  function renderActivities() {
    if (act.phase === "vote" || act.phase === "winner") renderVote(); else renderBooking();
  }

  function markBooked() {
    act.phase = "booked";
    const idea = ideaById[winnerId()];
    chat.messages.push({ from: "ai", text: `Booked 🎉 ${idea.title}, ${idea.when} at ${idea.place}. Everyone approved their share (${money2(idea.groupPrice)} each). Remember to check in together to unlock the group discount.` });
  }

  function approveMine() {
    act.approvals[me.id] = true;
    renderActivities();
    const waiting = chatMembers.filter(m => !act.approvals[m.id]);
    waiting.forEach((m, i) => {
      act.timers.push(setTimeout(() => {
        act.approvals[m.id] = true;
        if (i === waiting.length - 1) { act.timers = []; markBooked(); }
        renderActivities();
      }, 800 * (i + 1)));
    });
    if (!waiting.length) { markBooked(); renderActivities(); }
  }

  function finishActivityTimers() {
    // Leaving mid-animation: jump to where it was heading.
    if (!act.timers.length) return;
    act.timers.forEach(clearTimeout);
    act.timers = [];
    if (act.phase === "vote") { act.phase = "winner"; return; }
    chatMembers.forEach(m => { act.approvals[m.id] = true; });
    markBooked();
  }

  actRoot.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const action = el.dataset.act;
    if (action === "vote") {
      act.myVote = el.dataset.id;
      renderActivities();
      // Short pause so you see your vote land before the winner is shown.
      act.timers.push(setTimeout(() => { act.timers = []; act.phase = "winner"; renderActivities(); }, 700));
    }
    if (action === "book") { act.phase = "booking"; renderActivities(); screenArea.scrollTop = 0; }
    if (action === "approve") approveMine();
    if (action === "after") meetupOver();
  });

  // Demo time skip: the meetup ends, you land on Home and the rating pops up by itself.
  let rateTimer = null;
  function meetupOver() {
    document.querySelector(".status-bar__time").textContent = "12:05";
    location.hash = "#home";
    rateTimer = setTimeout(() => { rateTimer = null; location.hash = "#rating"; }, 1200);
  }

  // ---------- Rating: one tap after the meetup + private "meet again?" ----------
  const rateRoot = document.getElementById("rating-root");
  let rate = freshRating();

  function freshRating() {
    return { stars: 0, again: null }; // again: yes | maybe | no
  }

  const STAR_LABELS = ["Tap to rate", "Not for me", "Not great", "It was okay", "Good", "Loved it"];
  const AGAIN_OPTIONS = [
    { id: "yes", label: "Yes" },
    { id: "maybe", label: "Maybe" },
    { id: "no", label: "No" },
  ];
  const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>';

  // The meetup being rated: whatever the group booked, or brunch if the demo skipped booking.
  const ratedIdea = () => act.phase === "booked" ? ideaById[winnerId()] : ideaById.brunch;

  function againResult() {
    const msgs = {
      yes: ["Great, noted!", `We'll keep suggesting plans for ${G.name}.`],
      maybe: ["Thanks, noted.", "We'll keep your group and also mix in a few events with other students."],
      no: ["Thanks for being honest.", `We'll suggest a new group for you soon. No one in ${G.name} will be told.`],
    };
    const [title, text] = msgs[rate.again];
    return `
      <div class="result-card result-card--ok rating-done">
        <h3>${title}</h3>
        <p>${text}</p>
        <div class="result-card__actions"><a class="btn btn--primary" href="#home">Back to Home</a></div>
      </div>`;
  }

  function renderRating() {
    const idea = ratedIdea();
    const n = chatMembers.length;
    const hours = parseFloat(idea.duration.replace(/[^\d.]/g, "")) || 2;
    const saved = (idea.listPrice - idea.groupPrice) * n;

    const stars = [1, 2, 3, 4, 5].map(i => `
      <button class="star ${i <= rate.stars ? "is-on" : ""}" data-rate="star" data-value="${i}"
        aria-label="${i} star${i === 1 ? "" : "s"}: ${STAR_LABELS[i]}" aria-pressed="${i === rate.stars}">${STAR_SVG}</button>`).join("");

    const again = AGAIN_OPTIONS.map(o => `
      <button class="again-btn ${rate.again === o.id ? "is-on" : ""}" data-rate="again" data-value="${o.id}"
        aria-pressed="${rate.again === o.id}">${o.label}</button>`).join("");

    rateRoot.innerHTML = `
      <header class="app-header">
        <h1>How was it?</h1>
      </header>
      ${groupBar()}

      <section class="card meetup-recap">
        <h2>${idea.title}</h2>
        <p class="idea-card__meta">${icon("pin")}${idea.place}</p>
        <p class="idea-card__meta">${icon("clock")}Today · ${idea.when.replace(/^\w+ /, "")}</p>
        <div class="recap-stats">
          <div><strong>${hours} hrs</strong><span>together, ${n} of you</span></div>
          <div><strong>${money2(saved)}</strong><span>saved as a group</span></div>
        </div>
      </section>

      <section class="card rate-card">
        <h3>Rate the activity</h3>
        <div class="stars" role="group" aria-label="Rate the activity">${stars}</div>
        <p class="rate-label ${rate.stars ? "is-set" : ""}">${STAR_LABELS[rate.stars]}</p>
      </section>

      <section class="card again-card">
        <span class="private-badge">${icon("lock")}Private</span>
        <h3>Would you meet this group again?</h3>
        <div class="again" role="group" aria-label="Would you meet this group again?">${again}</div>
        <p class="again__note">Only you and CalConnect see this answer. Your group is never told.</p>
      </section>

      ${rate.again ? againResult() : ""}

      <p class="rating-note">${icon("shield")}Your ratings are private. CalConnect AI uses them to suggest better activities and matches for you.</p>`;
  }

  // Tapping the dimmed area above the sheet closes it, like iOS.
  document.querySelector(".rating-sheet").addEventListener("click", e => {
    if (e.target.classList.contains("rating-sheet")) location.hash = "#home";
  });

  rateRoot.addEventListener("click", e => {
    const el = e.target.closest("[data-rate]");
    if (!el) return;
    if (el.dataset.rate === "star") rate.stars = Number(el.dataset.value);
    if (el.dataset.rate === "again") rate.again = el.dataset.value;
    renderRating();
  });

  // ---------- Live AI settings (demo nav, outside the phone) ----------
  // The presenter's own Anthropic API key, kept only in this browser's localStorage.
  const liveAI = (() => {
    const STORE = "calconnect-claude-key";
    const els = {
      toggle: document.getElementById("live-ai-toggle"),
      panel: document.getElementById("live-ai-panel"),
      form: document.getElementById("live-ai-form"),
      input: document.getElementById("live-ai-key"),
      remove: document.getElementById("live-ai-remove"),
      status: document.getElementById("live-ai-status"),
    };
    let key = "";
    try { key = localStorage.getItem(STORE) || ""; } catch (e) { /* storage blocked: key lasts until reload */ }

    function setStatus(kind, detail) {
      els.toggle.dataset.state = key ? kind : "off";
      els.toggle.querySelector("span").textContent = !key ? "Off" : kind === "error" ? "Error" : "On";
      els.status.textContent = !key
        ? "Off: the AI uses offline sample replies."
        : kind === "error" ? `Last call failed (${detail}). Using offline replies.` : "On: Claude answers @AI messages.";
      els.remove.hidden = !key;
    }

    els.toggle.addEventListener("click", () => {
      els.panel.hidden = !els.panel.hidden;
      els.toggle.setAttribute("aria-expanded", String(!els.panel.hidden));
    });
    els.form.addEventListener("submit", e => {
      e.preventDefault();
      key = els.input.value.trim();
      els.input.value = "";
      try { key ? localStorage.setItem(STORE, key) : localStorage.removeItem(STORE); } catch (err) { /* ignore */ }
      setStatus("on");
    });
    els.remove.addEventListener("click", () => {
      key = "";
      try { localStorage.removeItem(STORE); } catch (err) { /* ignore */ }
      setStatus("off");
    });
    setStatus("on");

    return { key: () => key, setStatus };
  })();

  // ---------- Global ----------
  document.addEventListener("click", e => {
    if (e.target.closest("[data-action='retake']")) {
      state.step = "quiz"; state.qIndex = 0; state.skipped = false;
    }
  });

  document.getElementById("reset").addEventListener("click", () => {
    clearTimeout(timer);
    Object.assign(state, freshState(), { installing: false });
    group.timers.forEach(clearTimeout);
    group = freshGroup();
    chat.timers.forEach(clearTimeout);
    chat = freshChat();
    act.timers.forEach(clearTimeout);
    act = freshActivities();
    rate = freshRating();
    clearTimeout(rateTimer);
    document.querySelector(".status-bar__time").textContent = "9:41";
    if (location.hash === "#onboarding") route(); else location.hash = "#onboarding";
  });

  document.querySelectorAll("[data-name]").forEach(el => { el.textContent = DATA.student.name; });

  window.addEventListener("hashchange", () => {
    // Leaving onboarding mid-animation: stop timers so they don't jump screens later.
    if (currentScreen() !== "onboarding") {
      clearTimeout(timer);
      if (state.step === "splash") state.step = "welcome";
      if (state.step === "matching") state.step = "done";
      state.installing = false;
    }
    if (currentScreen() !== "group") finishGroupTimers();
    if (currentScreen() !== "chat") finishChatTimers();
    if (currentScreen() !== "activities") finishActivityTimers();
    if (currentScreen() !== "home") { clearTimeout(rateTimer); rateTimer = null; }
    route();
  });
  route();
})();
