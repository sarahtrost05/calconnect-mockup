(function () {
  const DATA = window.CC_DATA;
  const SCREENS = ["onboarding", "home", "group", "chat", "activities", "mentor", "rating"];

  // ---------- Demo state (in memory only; resets on reload) ----------
  const state = freshState();
  let matchTimer = null;

  function freshState() {
    return {
      step: "checklist", // checklist | quiz | connect | matching
      qIndex: 0,
      answers: {},       // question index -> array of chosen options
      connect: new Set(DATA.connectOptions.filter(o => o.default).map(o => o.id)),
      skipped: false,
    };
  }

  // ---------- Routing ----------
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
      const active = tab === screen || (tab === "group" && (screen === "chat"));
      a.classList.toggle("is-active", active);
    });
    document.querySelector(".tab-bar").hidden = screen === "onboarding";
    document.getElementById("skip-notice").hidden = !state.skipped;
    document.querySelector(".screen-area").scrollTop = 0;

    if (screen === "onboarding") renderOnboarding();
  }

  // ---------- Onboarding ----------
  const root = document.getElementById("onboarding-root");

  function renderOnboarding() {
    if (state.step === "checklist" || state.step === "done") return renderChecklist();
    if (state.step === "quiz") return renderQuiz();
    if (state.step === "connect") return renderConnect();
    if (state.step === "matching") return renderMatching();
  }

  function renderChecklist() {
    const done = state.step === "done";
    const items = DATA.checklist.map(item => `
      <li class="${item.done ? "is-done" : ""}">
        <span class="check ${item.done ? "check--done" : ""}" aria-hidden="true">${item.done ? "✓" : ""}</span>
        <span>${item.label}</span>
      </li>`).join("");

    root.innerHTML = `
      <div class="portal-bar"><strong>CalCentral</strong><span>My Dashboard</span></div>
      <div class="onboarding__body">
        <h2>Welcome, ${DATA.student.name}!</h2>
        <p class="onboarding__sub">Your new student checklist</p>
        <ul class="checklist">
          <li class="featured">
            <div class="featured__head">
              <span class="check ${done ? "check--done" : ""}" aria-hidden="true">${done ? "✓" : ""}</span>
              <div>
                <h3>Meet your CalConnect group ${done ? "" : '<span class="badge-new">NEW</span>'}</h3>
                <p>${done
                  ? "You're matched! Your group is waiting for you."
                  : "Get matched with 4–5 new students who share your interests and free time, plus group discounts on Berkeley and Bay Area activities."}</p>
              </div>
            </div>
            <div class="featured__actions">
              ${done
                ? `<a class="btn btn--primary" href="#home">Open CalConnect</a>
                   <button class="btn--link" data-action="start">${state.skipped ? "Take the quiz for better matches" : "Retake the quiz"}</button>`
                : `<button class="btn btn--primary" data-action="start">Start 10-question quiz</button>
                   <p class="featured__meta">About 2 minutes</p>
                   <button class="btn--link" data-action="skip">Skip for now and match me on basic info</button>`}
            </div>
          </li>
          ${items}
        </ul>
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
    clearTimeout(matchTimer);
    matchTimer = setTimeout(() => { state.step = "done"; location.hash = "#home"; }, 1800);
  }

  // ---------- Onboarding interactions ----------
  function go(step) {
    state.step = step;
    renderOnboarding();
    document.querySelector(".screen-area").scrollTop = 0;
  }

  root.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === "start") { state.qIndex = 0; state.skipped = false; return go("quiz"); }
    if (action === "skip") { state.skipped = true; state.connect = new Set(["fun"]); return go("matching"); }
    if (action === "match") return go("matching");
    if (action === "next") return nextQuestion();
    if (action === "back") {
      if (state.step === "connect") { state.qIndex = DATA.quiz.length - 1; return go("quiz"); }
      if (state.qIndex === 0) return go("checklist");
      state.qIndex--; return renderQuiz();
    }

    if (btn.dataset.option !== undefined) return pickOption(btn.dataset.option);

    if (btn.dataset.connect) {
      const id = btn.dataset.connect;
      state.connect.has(id) ? state.connect.delete(id) : state.connect.add(id);
      return renderConnect();
    }
  });

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

  // ---------- Global ----------
  document.addEventListener("click", e => {
    if (e.target.closest("[data-action='retake']")) {
      state.step = "quiz"; state.qIndex = 0; state.skipped = false;
    }
  });

  document.getElementById("reset").addEventListener("click", () => {
    clearTimeout(matchTimer);
    Object.assign(state, freshState());
    if (location.hash === "#onboarding") route(); else location.hash = "#onboarding";
  });

  document.querySelectorAll("[data-name]").forEach(el => { el.textContent = DATA.student.name; });

  window.addEventListener("hashchange", () => {
    if (currentScreen() !== "onboarding") clearTimeout(matchTimer);
    route();
  });
  route();
})();
