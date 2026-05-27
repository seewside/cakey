const screens = [...document.querySelectorAll(".screen")];
const stack = ["home"];
const surveyWebAppUrl = window.CAKEY_SURVEY_WEB_APP_URL || "";
const surveyQuestions = [
  "케이크 디자인을 선택하는 과정이 간편했나요?",
  "커스텀 옵션(문구, 색상 등) 설정이 직관적이었나요?",
  "추천 받은 가게가 마음에 들었나요?",
  "완성된 케이크 디자인이 원하는 결과물에 가까웠나요?",
  "애플리케이션의 반응 속도와 안정성에 만족하시나요?",
  "전반적으로 CAKEY 서비스를 지인에게 추천할 의향이 있나요?",
];

const optionData = {
  size: [
    ["도시락", 20000],
    ["미니", 36000],
    ["1호", 48000],
    ["2호", 62000],
  ],
  shape: [
    ["원형", 0, "○"],
    ["하트", 0, "♡"],
    ["사각형", 4000, "□"],
    ["기타", 0, "✦"],
  ],
  flavor: [
    ["초코오레오", 0],
    ["초코바나나", 0],
    ["바닐라쉬폰", 0],
  ],
  style: [
    ["러블리", 0, "♡"],
    ["심플", 0, "○"],
  ],
  mood: [
    ["캐릭터", 0],
    ["레터링중심", 0],
    ["화려함", 0],
  ],
  border: [
    ["없음", 0],
    ["크림테두리", 4000],
    ["점선테두리", 4000],
    ["꽃테두리", 4000],
  ],
  letteringType: [
    ["없음", 0],
    ["중앙레터링", 0],
    ["깃발레터링", 0],
    ["2겹레터링", 1000],
    ["무지개레터링", 3000],
  ],
  topping: [
    ["없음", 0],
    ["진주", 1000],
    ["스프링클", 1000],
    ["반짝이", 1000],
  ],
  cream: [
    ["없음", 0],
    ["하트", 3000],
    ["꽃", 3000],
    ["리본", 3000],
    ["레이스", 4000],
  ],
  character: [
    ["없음", 0],
    ["있음", 6000],
  ],
  plate: [
    ["없음", 0],
    ["있음", 1000],
  ],
};

const state = {
  size: "도시락",
  shape: "원형",
  flavor: "초코오레오",
  style: "러블리",
  mood: "캐릭터",
  border: "없음",
  letteringType: "없음",
  topping: "없음",
  color: "#ffd4e3",
  cream: "없음",
  character: "없음",
  plate: "없음",
};

const customColorToken = "custom-color";
let customColor = "#ffd4e3";
let colorPickerOpen = false;

const colors = [
  "#ffffff",
  "#ffd4e3",
  "#aee3f2",
  "#fff7bb",
  "#333333",
  "#e8edf7",
  "#d5ceca",
  "#c7e9ce",
  customColorToken,
];
const formatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

function activeScreen() {
  return screens.find((screen) => screen.classList.contains("active"));
}

function setBottomNav(name) {
  document.querySelector(".bottom-nav").style.display = ["business-pending", "cart-pending", "survey", "thanks"].includes(name) ? "none" : "grid";
}

function showScreen(name, push = true) {
  const current = activeScreen();
  const next = document.querySelector(`[data-screen="${name}"]`);
  if (!next || current === next) return;

  current?.classList.remove("active");
  next.classList.add("active");
  next.scrollTop = 0;
  document.querySelector(".app-shell").scrollTo({ top: 0, behavior: "smooth" });

  if (name === "home") {
    stack.splice(0, stack.length, "home");
  } else if (push) {
    stack.push(name);
  }

  updateSummary();
  observeReveals();
  setBottomNav(name);
}

function goBack() {
  if (stack.length <= 1) return showScreen("home", false);
  stack.pop();
  showScreen(stack.at(-1), false);
}

function priceOf(group, label) {
  return optionData[group]?.find((item) => item[0] === label)?.[1] ?? 0;
}

function totalPrice() {
  return Object.entries(state).reduce((sum, [group, label]) => sum + priceOf(group, label), 0);
}

function formatDelta(price) {
  if (price === 0) return "+0원";
  return `+${price.toLocaleString("ko-KR")}원`;
}

function isDisabled(group, label) {
  if (state.size !== "도시락") return false;
  if (group === "shape") return !["원형", "하트"].includes(label);
  if (group === "flavor") return label !== "초코오레오";
  return false;
}

function normalizeLunchboxRules() {
  if (state.size !== "도시락") return;
  if (!["원형", "하트"].includes(state.shape)) state.shape = "원형";
  state.flavor = "초코오레오";
}

function selectOption(group, label) {
  state[group] = label;
  normalizeLunchboxRules();
  renderOptions();
  updateSummary();
}

function createChip(group, [label, price, icon]) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chip";
  if (state[group] === label) button.classList.add("active");
  if (isDisabled(group, label)) {
    button.classList.add("disabled");
    button.disabled = true;
  }
  button.innerHTML = `${icon ? `<b>${icon}</b><br>` : ""}${label}<small>${formatDelta(price)}</small>`;
  button.addEventListener("click", () => selectOption(group, label));
  return button;
}

function renderOptions() {
  document.querySelector(".app-shell").classList.toggle("color-picker-open", colorPickerOpen);
  Object.entries(optionData).forEach(([group, items]) => {
    const root = document.querySelector(`[data-group="${group}"]`);
    if (!root) return;
    root.innerHTML = "";
    items.forEach((item) => {
      if (group === "style") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `style-card${state.style === item[0] ? " active" : ""}`;
        button.innerHTML = `<b>${item[2]}</b><span>${item[0]}</span>`;
        button.addEventListener("click", () => selectOption("style", item[0]));
        root.append(button);
      } else {
        root.append(createChip(group, item));
      }
    });
  });

  const swatches = document.querySelector('[data-group="color"]');
  document.querySelector(".color-picker-panel")?.remove();
  swatches.innerHTML = "";
  colors.forEach((color) => {
    const isCustomColor = color === customColorToken;
    const isActive = isCustomColor
      ? colorPickerOpen || !colors.includes(state.color)
      : state.color === color;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `swatch${isCustomColor ? " rainbow-swatch" : ""}${isActive ? " active" : ""}`;
    button.style.background = isCustomColor ? "linear-gradient(135deg,#b9fff2,#fff0a6,#ffc1d9)" : color;
    button.setAttribute("aria-label", isCustomColor ? "자유 색상 선택" : `색상 ${color}`);
    if (isCustomColor) {
      button.innerHTML = '<span class="eyedropper-icon" aria-hidden="true"></span>';
    }
    button.addEventListener("click", () => {
      if (isCustomColor) {
        colorPickerOpen = !colorPickerOpen;
        state.color = customColor;
        renderOptions();
        return;
      }
      colorPickerOpen = false;
      state.color = color;
      renderOptions();
    });
    swatches.append(button);
  });

  if (colorPickerOpen) {
    const panel = document.createElement("div");
    panel.className = "color-picker-panel";
    panel.innerHTML = `
      <label class="color-wheel" aria-label="자유롭게 색상 선택">
        <input id="customColorPicker" type="color" value="${customColor}" />
        <span></span>
      </label>
      <div class="custom-color-row">
        <span class="custom-color-preview" style="background:${customColor}"></span>
        <strong>${customColor.toUpperCase()}</strong>
      </div>
    `;
    swatches.after(panel);

    const picker = panel.querySelector("#customColorPicker");
    picker.addEventListener("input", (event) => {
      customColor = event.target.value;
      state.color = customColor;
      panel.querySelector(".custom-color-preview").style.background = customColor;
      panel.querySelector(".custom-color-row strong").textContent = customColor.toUpperCase();
    });
  }

  document.getElementById("totalPrice").textContent = formatter.format(totalPrice());
}

function updateSummary() {
  const price = formatter.format(totalPrice());
  document.getElementById("summaryPrice").textContent = price;
  const summary = document.getElementById("summaryList");
  if (!summary) return;
  summary.innerHTML = `
    <dt>SIZE · SHAPE · FLAVOR</dt>
    <dd>${state.size} · ${state.shape} · ${state.flavor}</dd>
    <dt>MOOD & PALETTE</dt>
    <dd>${state.style} · ${state.mood}</dd>
    <dt>DECORATIONS</dt>
    <dd>${[state.border, state.topping, state.cream, state.character === "있음" ? "캐릭터" : "", state.plate === "있음" ? "판 레터링" : ""].filter(Boolean).join(" · ")}</dd>
  `;
}

function buildSurvey() {
  const root = document.getElementById("questions");
  root.innerHTML = surveyQuestions.map((question, index) => `
    <section class="survey-card" data-question-index="${index}">
      <h2>${index + 1}. ${question}</h2>
      <div class="rating" role="group" aria-label="${question}">
        ${[1, 2, 3, 4, 5].map((score) => `<button type="button" data-score="${score}">${score}</button>`).join("")}
      </div>
      <div class="scale-labels"><span>매우 아니다</span><span>매우 그렇다</span></div>
    </section>
  `).join("");
  root.querySelectorAll(".rating button").forEach((button) => {
    button.addEventListener("click", () => {
      [...button.parentElement.children].forEach((peer) => peer.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

function setSurveyStatus(message) {
  const status = document.getElementById("surveyStatus");
  if (status) status.textContent = message;
}

function collectSurveyPayload() {
  const scores = surveyQuestions.map((question, index) => {
    const active = document.querySelector(`[data-question-index="${index}"] .rating button.active`);
    return {
      question,
      score: active ? Number(active.dataset.score) : "",
    };
  });

  return {
    submittedAt: new Date().toISOString(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    scores,
    comment: document.getElementById("surveyComment")?.value.trim() || "",
    order: {
      size: state.size,
      shape: state.shape,
      flavor: state.flavor,
      style: state.style,
      mood: state.mood,
      border: state.border,
      letteringType: state.letteringType,
      topping: state.topping,
      color: state.color,
      cream: state.cream,
      character: state.character,
      plate: state.plate,
      price: totalPrice(),
    },
  };
}

async function saveSurveyResponse() {
  if (!surveyWebAppUrl) {
    console.warn("CAKEY_SURVEY_WEB_APP_URL is not configured.");
    return;
  }

  await fetch(surveyWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(collectSurveyPayload()),
  });
}

function setCompletedDate() {
  const now = new Date();
  const formatted = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join(".");
  document.getElementById("completedDate").textContent = formatted;
}

let observer;
function observeReveals() {
  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });

  activeScreen()?.querySelectorAll(".reveal").forEach((node, index) => {
    node.classList.remove("visible");
    node.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
    observer.observe(node);
  });
}

document.addEventListener("click", (event) => {
  const logo = event.target.closest(".topbar .logo, .survey-top .logo");
  const next = event.target.closest("[data-next]");
  const back = event.target.closest("[data-back]");
  if (logo) showScreen("home");
  if (next) showScreen(next.dataset.next);
  if (back) goBack();
});

document.querySelectorAll(".topbar .logo, .survey-top .logo").forEach((logo) => {
  logo.setAttribute("role", "button");
  logo.setAttribute("tabindex", "0");
  logo.setAttribute("aria-label", "홈으로 돌아가기");
  logo.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    showScreen("home");
  });
});

document.getElementById("lettering").addEventListener("input", (event) => {
  document.getElementById("letterCount").textContent = event.target.value.length;
});

document.getElementById("submitSurvey").addEventListener("click", async () => {
  const button = document.getElementById("submitSurvey");
  button.disabled = true;
  setSurveyStatus("응답을 저장하고 있어요.");

  try {
    await saveSurveyResponse();
    setSurveyStatus("");
    setCompletedDate();
    showScreen("thanks");
  } catch (error) {
    console.error(error);
    setSurveyStatus("저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    button.disabled = false;
  }
});

document.getElementById("goHome").addEventListener("click", () => {
  showScreen("home");
});

renderOptions();
buildSurvey();
updateSummary();
observeReveals();
setBottomNav("home");
