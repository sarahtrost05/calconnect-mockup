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
      el.classList.toggle("is-active", el.dataset.screen === screen);
    });
    document.querySelectorAll(".demo-nav a").forEach(a => {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + screen);
    });
    document.querySelectorAll(".tab-bar a").forEach(a => {
      const tab = a.dataset.tab;
      a.classList.toggle("is-active", tab === screen || (tab === "group" && screen === "chat"));
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
    return { messages: C.seed.map(m => ({ ...m })), pending: [], typing: null, timers: [], askedIdeas: false, smallTalkIndex: 0 };
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
    if (chat.typing) list.push({ from: chat.typing, typing: true });

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
      if (/idea|saturday|weekend|plan|do\b|hang/i.test(text)) {
        chat.askedIdeas = true;
        let t = queueMessage({ from: "ai", ...C.ideasReply }, 300);
        C.reactions.forEach(r => { t = queueMessage({ ...r }, t + 500); });
      } else {
        queueMessage({ from: "ai", text: C.otherReply }, 300);
      }
    } else {
      const reply = C.smallTalk[chat.smallTalkIndex++ % C.smallTalk.length];
      queueMessage({ ...reply }, 500);
    }
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
    chat.typing = null;
    chat.messages.push(...chat.pending);
    chat.pending = [];
  }

  chatEls.form.addEventListener("submit", e => { e.preventDefault(); sendMessage(chatEls.input.value); });
  chatEls.chip.addEventListener("click", typeSuggestion);

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
    route();
  });
  route();
})();
