const screens = [...document.querySelectorAll(".screen")];
const stack = ["home"];
const API_BASE_URL =
  window.CAKEY_API_BASE_URL ||
  localStorage.getItem("CAKEY_API_BASE_URL") ||
  "http://127.0.0.1:8000";
const TAG_WEIGHTS = {
  character_type: 4,
  dominant_color: 3,
  visual_style: 3,
  border_type: 2,
  lettering_type: 2,
  cream_decoration: 2,
  topping_decoration: 1,
  shape: 1,
  board_lettering: 1,
  text_presence: 1,
};
const demoRecommendations = [
  {
    cake_crop_id: "demo-onyourday-1",
    original_image_id: "demo-original-1",
    shop_name: "온유어데이",
    crop_image_url: "./assets/onyourday-cakes-1.png",
    original_image_url: "./assets/onyourday-cakes-1.png",
    all_tags: {
      shape: ["하트"],
      dominant_color: ["핑크", "화이트"],
      visual_style: ["러블리"],
      lettering_type: ["중앙레터링"],
      border_type: ["크림테두리"],
      cream_decoration: ["하트"],
      topping_decoration: ["스프링클"],
      character_type: ["없음"],
      text_presence: ["있음"],
    },
  },
  {
    cake_crop_id: "demo-onyourday-2",
    original_image_id: "demo-original-2",
    shop_name: "온유어데이",
    crop_image_url: "./assets/onyourday-cakes-2.png",
    original_image_url: "./assets/onyourday-cakes-2.png",
    all_tags: {
      shape: ["원형"],
      dominant_color: ["화이트", "그린"],
      visual_style: ["심플", "레터링중심"],
      lettering_type: ["중앙레터링"],
      border_type: ["크림테두리"],
      cream_decoration: ["꽃"],
      topping_decoration: ["없음"],
      character_type: ["없음"],
      text_presence: ["있음"],
    },
  },
  {
    cake_crop_id: "demo-onyourday-3",
    original_image_id: "demo-original-3",
    shop_name: "온유어데이",
    crop_image_url: "./assets/onyourday-cakes-3.png",
    original_image_url: "./assets/onyourday-cakes-3.png",
    all_tags: {
      shape: ["원형"],
      dominant_color: ["핑크", "퍼플"],
      visual_style: ["러블리", "화려함"],
      lettering_type: ["중앙레터링"],
      border_type: ["점선테두리"],
      cream_decoration: ["하트"],
      topping_decoration: ["진주"],
      character_type: ["없음"],
      text_presence: ["있음"],
    },
  },
  {
    cake_crop_id: "demo-onyourday-4",
    original_image_id: "demo-original-4",
    shop_name: "온유어데이",
    crop_image_url: "./assets/onyourday-cakes-4.png",
    original_image_url: "./assets/onyourday-cakes-4.png",
    all_tags: {
      shape: ["원형"],
      dominant_color: ["화이트", "핑크"],
      visual_style: ["캐릭터", "러블리"],
      lettering_type: ["중앙레터링"],
      border_type: ["크림테두리"],
      cream_decoration: ["리본"],
      topping_decoration: ["반짝이"],
      character_type: ["기타캐릭터"],
      text_presence: ["있음"],
    },
  },
];
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
let recommendationResults = [];
let selectedRecommendation = null;
let recommendationRequestId = 0;
let customizePreviewData = null;
let generatedCustomizeImageUrl = null;
let characterReferenceImageUrl = null;

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
  if (name === "preview") fetchRecommendations();
  if (["shop", "confirm", "order"].includes(name)) updateRecommendationViews();
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
  if (group === "character" && label === "없음") clearCharacterReference();
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
      button.innerHTML = `
        <svg class="eyedropper-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <g transform="rotate(45 12 12)">
            <rect x="8.9" y="2.2" width="6.2" height="5.2" rx="1.9"></rect>
            <path d="M9.9 6.2h4.2v9.4l-2.1 2.6-2.1-2.6z"></path>
            <rect class="eyedropper-highlight" x="10.5" y="9.1" width="3" height="4.7" rx="0.9"></rect>
            <path d="M8.2 14.7h7.6l-2.8 3.7v2h-2v-2z"></path>
            <circle cx="12" cy="22" r="1.7"></circle>
          </g>
        </svg>
      `;
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
  updateCharacterReferenceControls();
}

function updateSummary() {
  const price = formatter.format(totalPrice());
  document.getElementById("summaryPrice").textContent = price;
  const summary = document.getElementById("summaryList");
  if (!summary) return;
  const recommendationLine = selectedRecommendation
    ? `
      <dt>RECOMMENDED DESIGN</dt>
      <dd>${displayShopName(selectedRecommendation)} · 점수 ${selectedRecommendation.score}</dd>
    `
    : "";
  const aiLine = generatedCustomizeImageUrl
    ? `
      <dt>AI CUSTOM IMAGE</dt>
      <dd>사용자 선택 옵션이 반영된 AI 수정 이미지 포함</dd>
    `
    : "";
  summary.innerHTML = `
    <dt>SIZE · SHAPE · FLAVOR</dt>
    <dd>${state.size} · ${state.shape} · ${state.flavor}</dd>
    <dt>MOOD & PALETTE</dt>
    <dd>${state.style} · ${state.mood}</dd>
    <dt>DECORATIONS</dt>
    <dd>${[state.border, state.topping, state.cream, state.character === "있음" ? "캐릭터" : "", state.plate === "있음" ? "판 레터링" : ""].filter(Boolean).join(" · ")}</dd>
    ${recommendationLine}
    ${aiLine}
  `;
}

function imageUrl(path) {
  if (!path) return "./assets/cake-hero.jpg";
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("./") || path.startsWith("assets/")) return path;
  return `${API_BASE_URL}${path}`;
}

function thumbUrl(path) {
  if (!path) return "./assets/cake-hero.jpg";
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("./") || path.startsWith("assets/")) return path;
  const fileName = path.split("/").pop();
  const stem = fileName.replace(/\.[^.]+$/, "");
  return `${API_BASE_URL}/static/thumbs/crops/${encodeURIComponent(stem)}.webp`;
}

function tagValues(tags) {
  return Object.values(tags || {}).flat();
}

function formatTags(tags) {
  const values = tagValues(tags);
  return values.length ? values.join(" · ") : "매칭 태그 없음";
}

function displayShopName(item) {
  const rawName = item?.shop_name?.trim();
  if (!rawName || rawName.toLowerCase() === "unknown") return "온유어데이";
  return rawName;
}

function colorToTag(color) {
  const colorMap = {
    "#ffffff": "화이트",
    "#ffd4e3": "핑크",
    "#aee3f2": "블루",
    "#fff7bb": "옐로우",
    "#333333": "블랙",
    "#e8edf7": "퍼플",
    "#d5ceca": "브라운",
    "#c7e9ce": "그린",
  };
  return colorMap[color.toLowerCase()] || "믹스";
}

function addTag(tags, key, value, allowedValues = null) {
  if (!value || value === "기타") return;
  if (allowedValues && !allowedValues.includes(value)) return;
  tags[key] = [...new Set([...(tags[key] || []), value])];
}

function buildRecommendTags() {
  const tags = {};
  const lettering = document.getElementById("lettering")?.value.trim();
  const shape = state.shape === "사각형" ? "사각" : state.shape;

  addTag(tags, "shape", shape, ["원형", "하트", "사각"]);
  addTag(tags, "dominant_color", colorToTag(state.color));
  addTag(tags, "visual_style", state.style, ["심플", "러블리", "캐릭터", "레터링중심", "화려함"]);
  addTag(tags, "visual_style", state.mood, ["심플", "러블리", "캐릭터", "레터링중심", "화려함"]);
  addTag(tags, "border_type", state.border);
  addTag(tags, "lettering_type", state.letteringType, ["없음", "중앙레터링", "꽉찬레터링", "2겹레터링", "무지개레터링"]);
  addTag(tags, "cream_decoration", state.cream);
  addTag(tags, "topping_decoration", state.topping);
  addTag(tags, "board_lettering", state.plate);
  addTag(tags, "text_presence", lettering ? "있음" : "없음");
  addTag(tags, "character_type", state.character === "있음" ? "기타캐릭터" : "없음");

  return tags;
}

function scoreDemoRecommendation(item, requestedTags) {
  const matchedTags = {};
  const score = Object.entries(requestedTags).reduce((total, [key, values]) => {
    const itemValues = item.all_tags[key] || [];
    const matches = values.filter((value) => itemValues.includes(value));
    if (!matches.length) return total;
    matchedTags[key] = matches;
    return total + (TAG_WEIGHTS[key] || 1);
  }, 0);

  return {
    ...item,
    score,
    matched_tags: matchedTags,
  };
}

function buildDemoRecommendations(limit = 8) {
  const requestedTags = buildRecommendTags();
  return demoRecommendations
    .map((item) => scoreDemoRecommendation(item, requestedTags))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function setRecommendationStatus(message) {
  const status = document.getElementById("recommendationStatus");
  if (status) status.textContent = message;
}

function resetCustomizeState() {
  customizePreviewData = null;
  generatedCustomizeImageUrl = null;
  renderCustomizeDiff({});
  document.getElementById("customizePrompt").textContent = "";
  document.getElementById("customizeCompare").hidden = true;
  updateCustomizeProgress("idle");
  setCustomizeStatus("추천 결과를 선택하면 변경 요청사항을 확인할 수 있어요.");
}

function setCharacterReferenceStatus(message) {
  const status = document.getElementById("characterReferenceStatus");
  if (status) status.textContent = message;
}

function updateCharacterReferenceControls() {
  const panel = document.getElementById("characterReferencePanel");
  const description = document.querySelector(".character-detail");
  const isEnabled = state.character === "있음";
  if (panel) panel.hidden = !isEnabled;
  if (description) description.hidden = !isEnabled;
}

function clearCharacterReference() {
  characterReferenceImageUrl = null;
  const input = document.getElementById("characterReferenceInput");
  const preview = document.getElementById("characterReferencePreview");
  const image = document.getElementById("characterReferenceImage");
  if (input) input.value = "";
  if (preview) preview.hidden = true;
  if (image) image.src = "./assets/cake-hero.jpg";
  setCharacterReferenceStatus("참고 이미지는 AI 수정 단계에서만 사용됩니다.");
}

async function uploadCharacterReference(file) {
  if (!file) return;
  const localPreviewUrl = URL.createObjectURL(file);
  const preview = document.getElementById("characterReferencePreview");
  const image = document.getElementById("characterReferenceImage");
  if (image) image.src = localPreviewUrl;
  if (preview) preview.hidden = false;
  setCharacterReferenceStatus("참고 이미지를 업로드하는 중입니다.");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/customize/reference-image`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    characterReferenceImageUrl = data.image_url;
    if (image) image.src = imageUrl(characterReferenceImageUrl);
    setCharacterReferenceStatus("참고 이미지가 AI 수정 요청에 포함됩니다.");
  } catch (error) {
    characterReferenceImageUrl = null;
    if (preview) preview.hidden = true;
    setCharacterReferenceStatus(`참고 이미지 업로드 실패: ${error.message}`);
  } finally {
    URL.revokeObjectURL(localPreviewUrl);
  }
}

async function fetchRecommendations() {
  const requestId = ++recommendationRequestId;
  setRecommendationStatus("선택 옵션과 비슷한 케이크를 찾는 중입니다.");

  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: buildRecommendTags(), limit: 8 }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (requestId !== recommendationRequestId) return;
    recommendationResults = data.results || [];
    selectedRecommendation = recommendationResults[0] || null;
    resetCustomizeState();
    renderRecommendations();
    updateRecommendationViews();
    setRecommendationStatus(
      recommendationResults.length
        ? `${recommendationResults.length}개의 추천 케이크를 찾았습니다.`
        : "조건에 맞는 추천 결과가 아직 없습니다. 옵션을 조금 바꿔보세요."
    );
  } catch (error) {
    if (requestId !== recommendationRequestId) return;
    recommendationResults = buildDemoRecommendations(8);
    selectedRecommendation = recommendationResults[0] || null;
    resetCustomizeState();
    renderRecommendations();
    updateRecommendationViews();
    setRecommendationStatus(
      recommendationResults.length
        ? "배포 페이지에서는 샘플 추천 데이터로 보여드리고 있어요."
        : "추천 API 연결에 실패했고 샘플 조건에도 맞는 결과가 없습니다."
    );
    console.warn("Recommendation request failed:", error.message);
  }
}

function renderRecommendations() {
  const list = document.getElementById("recommendationList");
  if (!list) return;
  list.innerHTML = "";

  recommendationResults.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `recommendation-card${item === selectedRecommendation ? " active" : ""}`;
    button.innerHTML = `
      <img src="${thumbUrl(item.crop_image_url)}" alt="추천 케이크 ${index + 1}" loading="lazy" />
      <span>추천 ${index + 1}</span>
      <strong>점수 ${item.score}</strong>
      <small>${formatTags(item.matched_tags)}</small>
    `;
    button.addEventListener("click", () => {
      selectedRecommendation = item;
      resetCustomizeState();
      renderRecommendations();
      updateRecommendationViews();
    });
    list.append(button);
  });
}

function updateRecommendationViews() {
  const item = selectedRecommendation;
  const cropUrl = imageUrl(item?.crop_image_url);
  const originalUrl = imageUrl(item?.original_image_url);
  const finalImageUrl = generatedCustomizeImageUrl ? imageUrl(generatedCustomizeImageUrl) : cropUrl;
  const otherImages = recommendationResults.filter((result) => result !== item);

  const previewImage = document.getElementById("previewImage");
  const summaryImage = document.getElementById("summaryImage");

  if (previewImage) previewImage.src = cropUrl;
  if (summaryImage) summaryImage.src = finalImageUrl;

  const shopName = displayShopName(item);
  const shopInfoTitle = document.getElementById("shopInfoTitle");
  const shopInfoText = document.getElementById("shopInfoText");
  if (shopInfoTitle) shopInfoTitle.textContent = shopName;
  if (shopInfoText) {
    shopInfoText.textContent = item
      ? `✨Since 2020
🎂군자동 369-16 어린이대공원역
선택 옵션과 ${item.score}점으로 매칭된 실제 제작 사례입니다.`
      : "선택한 옵션과 가장 가까운 실제 제작 사례입니다.";
  }

  document.getElementById("matchedTagLine").innerHTML = `<span>◎</span> ${formatTags(item?.matched_tags)}`;
  document.getElementById("scoreLine").innerHTML = `<span>♛</span> 추천 점수 ${item?.score ?? 0}`;
  document.getElementById("allTagLine").innerHTML = `<span>彩</span> ${formatTags(item?.all_tags)}`;
  updateApplicationPreviews();
  updateSummary();
}

function setCustomizeStatus(message) {
  const status = document.getElementById("customizeStatus");
  if (status) status.textContent = message;
}

function updateCustomizeProgress(stage) {
  const stepOrder = ["analyze", "diff", "edit", "ready"];
  const activeIndex = stepOrder.indexOf(stage);
  document.querySelectorAll("#customizeProgress li").forEach((item, index) => {
    item.classList.toggle("done", activeIndex > index || stage === "ready");
    item.classList.toggle("active", stepOrder[index] === stage && stage !== "ready");
  });
  if (stage === "idle") {
    document.querySelectorAll("#customizeProgress li").forEach((item) => {
      item.classList.remove("done", "active");
    });
  }
}

function updateApplicationPreviews() {
  const item = selectedRecommendation;
  const hasGenerated = Boolean(item && generatedCustomizeImageUrl);
  const cropUrl = imageUrl(item?.crop_image_url);
  const generatedUrl = imageUrl(generatedCustomizeImageUrl);
  const shopName = displayShopName(item);

  [
    "shopApplicationPreview",
    "confirmApplicationPreview",
    "orderApplicationPreview",
  ].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.hidden = !hasGenerated;
  });

  [
    "shopReferenceImage",
    "confirmReferenceImage",
    "orderReferenceImage",
  ].forEach((id) => {
    const image = document.getElementById(id);
    if (image && item) image.src = cropUrl;
  });

  [
    "shopAiImage",
    "confirmAiImage",
    "orderAiImage",
  ].forEach((id) => {
    const image = document.getElementById(id);
    if (image && hasGenerated) image.src = generatedUrl;
  });

  const orderText = document.getElementById("orderApplicationText");
  if (orderText && hasGenerated) {
    orderText.textContent = `${shopName}에 기존 제작 참고 이미지와 사용자 의도 반영 AI 수정 이미지를 함께 전달합니다.`;
  }
}

function renderCustomizeDiff(diffTags) {
  const root = document.getElementById("customizeDiff");
  if (!root) return;
  const entries = Object.entries(diffTags || {});
  if (!entries.length) {
    root.innerHTML = '<div class="customize-row">추천 이미지와 선택 옵션의 주요 태그 차이가 없습니다.</div>';
    return;
  }
  root.innerHTML = entries.map(([key, diff]) => `
    <div class="customize-row">
      <span>${key}</span>
      <strong>${(diff.from || []).join(" · ") || "없음"} → ${(diff.to || []).join(" · ") || "없음"}</strong>
    </div>
  `).join("");
}

async function previewCustomize() {
  if (!selectedRecommendation) {
    setCustomizeStatus("먼저 추천 결과를 선택해주세요.");
    return null;
  }
  updateCustomizeProgress("analyze");
  setCustomizeStatus("변경 요청사항을 계산하는 중입니다.");
  const response = await fetch(`${API_BASE_URL}/customize/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cake_crop_id: selectedRecommendation.cake_crop_id,
      target_tags: buildRecommendTags(),
      lettering_text: document.getElementById("lettering")?.value.trim() || null,
      extra_request: document.getElementById("extraCustomizeRequest")?.value.trim() || null,
      character_description: document.getElementById("characterDescription")?.value.trim() || null,
      character_reference_image_url: state.character === "있음" ? characterReferenceImageUrl : null,
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  customizePreviewData = data;
  updateCustomizeProgress("diff");
  renderCustomizeDiff(data.diff_tags);
  document.getElementById("customizePrompt").textContent = data.prompt;
  setCustomizeStatus("AI가 수정해야 할 차이를 정리했습니다.");
  return data;
}

async function generateCustomize() {
  if (!selectedRecommendation) {
    setCustomizeStatus("먼저 추천 결과를 선택해주세요.");
    return;
  }
  updateCustomizeProgress("edit");
  setCustomizeStatus("AI 이미지 수정을 요청 중입니다. 30초 이상 걸릴 수 있습니다.");
  const button = document.getElementById("generateCustomize");
  if (button) button.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/customize/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cake_crop_id: selectedRecommendation.cake_crop_id,
        target_tags: buildRecommendTags(),
        lettering_text: document.getElementById("lettering")?.value.trim() || null,
        extra_request: document.getElementById("extraCustomizeRequest")?.value.trim() || null,
        character_description: document.getElementById("characterDescription")?.value.trim() || null,
        character_reference_image_url: state.character === "있음" ? characterReferenceImageUrl : null,
        model: "gpt-image-1-mini",
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    customizePreviewData = data;
    renderCustomizeDiff(data.diff_tags);
    document.getElementById("customizePrompt").textContent = data.prompt;
    if (data.status !== "ok") throw new Error(data.error || "AI 수정 실패");
    generatedCustomizeImageUrl = data.generated_image_url;
    document.getElementById("customizeBaseImage").src = imageUrl(data.base_crop_image_url);
    document.getElementById("customizeGeneratedImage").src = imageUrl(data.generated_image_url);
    document.getElementById("customizeCompare").hidden = false;
    updateCustomizeProgress("ready");
    updateRecommendationViews();
    setCustomizeStatus("AI 수정 결과가 생성되었습니다.");
  } catch (error) {
    updateCustomizeProgress(customizePreviewData ? "diff" : "idle");
    setCustomizeStatus(`AI 수정 실패: ${error.message}`);
  } finally {
    if (button) button.disabled = false;
  }
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
      button.closest(".survey-card")?.classList.remove("missing");
      setSurveyStatus("");
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
    submittedAtLocal: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
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
      recommendedCakeCropId: selectedRecommendation?.cake_crop_id || "",
      recommendedShopName: selectedRecommendation ? displayShopName(selectedRecommendation) : "",
      generatedCustomizeImageUrl: generatedCustomizeImageUrl || "",
      characterReferenceImageUrl: characterReferenceImageUrl || "",
    },
  };
}

function validateSurvey() {
  const missing = [];

  surveyQuestions.forEach((_, index) => {
    const card = document.querySelector(`[data-question-index="${index}"]`);
    const hasAnswer = card?.querySelector(".rating button.active");
    card?.classList.toggle("missing", !hasAnswer);
    if (!hasAnswer) missing.push(index + 1);
  });

  if (missing.length) {
    setSurveyStatus(`${missing.join(", ")}번 문항에 답변해 주세요.`);
    document.querySelector(`[data-question-index="${missing[0] - 1}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return false;
  }

  return true;
}

async function saveSurveyResponse() {
  const payload = collectSurveyPayload();
  const surveyWebAppUrl = window.CAKEY_SURVEY_WEB_APP_URL || "";
  let saved = false;

  if (surveyWebAppUrl) {
    await submitSurveyToAppsScript(surveyWebAppUrl, payload);
    saved = true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/survey/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) saved = true;
  } catch (error) {
    console.warn("Backend survey save skipped:", error.message);
  }

  if (!saved) throw new Error("Survey save endpoint is not configured.");
}

function submitSurveyToAppsScript(url, payload) {
  const endpoint = `${url}?payload=${encodeURIComponent(JSON.stringify(payload))}`;
  return fetch(endpoint, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
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
  const logo = event.target.closest(".topbar .logo");
  const next = event.target.closest("[data-next]");
  const back = event.target.closest("[data-back]");
  if (logo) showScreen("home");
  if (next) showScreen(next.dataset.next);
  if (back) goBack();
});

document.querySelectorAll(".topbar .logo").forEach((logo) => {
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

document.getElementById("extraCustomizeRequest")?.addEventListener("input", (event) => {
  document.getElementById("extraRequestCount").textContent = event.target.value.length;
});

document.getElementById("characterDescription")?.addEventListener("input", (event) => {
  document.getElementById("characterDescriptionCount").textContent = event.target.value.length;
});

document.getElementById("characterReferenceInput")?.addEventListener("change", async (event) => {
  await uploadCharacterReference(event.target.files?.[0]);
});

document.getElementById("clearCharacterReference")?.addEventListener("click", clearCharacterReference);

document.getElementById("submitSurvey").addEventListener("click", async () => {
  if (!validateSurvey()) return;

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
    setSurveyStatus("저장 설정을 확인해 주세요. Apps Script 웹앱 URL이 필요합니다.");
    button.disabled = false;
  }
});

document.getElementById("goHome").addEventListener("click", () => {
  showScreen("home");
});

document.getElementById("refreshRecommendations")?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  fetchRecommendations();
});

document.getElementById("previewCustomize")?.addEventListener("click", async () => {
  try {
    await previewCustomize();
  } catch (error) {
    setCustomizeStatus(`변경 요청사항 생성 실패: ${error.message}`);
  }
});

document.getElementById("generateCustomize")?.addEventListener("click", generateCustomize);

renderOptions();
buildSurvey();
updateSummary();
observeReveals();
setBottomNav("home");
