const screens = [...document.querySelectorAll("[data-screen]")];
const navButtons = [...document.querySelectorAll(".bottom-nav button")];
const cakeForm = document.querySelector("#cakeForm");
const detailForm = document.querySelector(".details-form");

const screenNavMap = {
  home: "shops",
  shops: "shops",
  options: "options",
  preview: "preview",
  confirm: "preview",
  details: "options",
  done: "done",
};

function valueOf(name) {
  const checked = cakeForm.querySelector(`[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function checkedValues(name) {
  return [...cakeForm.querySelectorAll(`[name="${name}"]:checked`)].map((item) => item.value);
}

function syncSummary() {
  const style = valueOf("style") || "러블리";
  const color = valueOf("color") || "소프트 핑크";
  const message = cakeForm.message.value.trim() || "Happy Birthday!";
  const decor = checkedValues("decor");

  const decorText = decor.length ? decor.join(", ") : "데코 없음";
  const prettyStyle = style === "러블리" ? "Lovely Style" : "Minimal Style";

  setText("[data-summary-color]", `${color} 베이스`);
  setText("[data-summary-decor]", `${decorText} 포인트`);
  setText("[data-summary-style]", `${style} 무드와 영문 레터링`);
  setText("[data-final-style]", prettyStyle);
  setText("[data-final-style-2]", prettyStyle);
  setText("[data-final-color]", color);
  setText("[data-final-color-2]", color);
  setText("[data-final-message]", `"${message}"`);
  setText("[data-final-message-2]", `Lettering: ${message}`);
  setText("[data-final-decor]", decorText);
}

function syncReceipt() {
  const date = detailForm.date.value.trim();
  const time = detailForm.time.value.trim();
  const name = detailForm.name.value.trim();
  const phone = detailForm.phone.value.trim();

  setText("[data-receipt-date]", `${date} / ${time}`);
  setText("[data-receipt-user]", `${name} (${phone})`);
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function goTo(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("hidden", screen.dataset.screen !== screenName);
  });

  navButtons.forEach((button) => {
    const target = button.dataset.go;
    button.classList.toggle("active", target === screenNavMap[screenName]);
  });

  if (screenName === "preview" || screenName === "confirm" || screenName === "done") {
    syncSummary();
  }

  if (screenName === "done") {
    syncReceipt();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go]");
  if (!trigger) return;

  const screenName = trigger.dataset.go;
  if (screenName) goTo(screenName);
});

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

cakeForm.addEventListener("input", syncSummary);
cakeForm.addEventListener("change", syncSummary);
detailForm.addEventListener("input", syncReceipt);

syncSummary();
syncReceipt();
goTo("home");
