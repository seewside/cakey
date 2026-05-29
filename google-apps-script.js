const SPREADSHEET_ID = "1__HSLMmRvGQGWqgH7we0VkAvbX1M6NJO";
const SHEET_NAME = "cakey_사용자_만족도_데이터";

const HEADERS = [
  "저장일시",
  "제출일시(UTC)",
  "제출일시(KST)",
  "페이지",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Q5",
  "Q6",
  "기타 건의사항",
  "사이즈",
  "모양",
  "맛",
  "스타일",
  "무드",
  "테두리",
  "레터링 타입",
  "토핑",
  "색상",
  "크림 데코",
  "캐릭터",
  "판 레터링",
  "가격",
  "브라우저",
];

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || "{}");
  const sheet = getSurveySheet();
  sheet.appendRow(toRow(payload));

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSurveySheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function toRow(payload) {
  const scores = payload.scores || [];
  const order = payload.order || {};

  return [
    new Date(),
    payload.submittedAt || "",
    payload.submittedAtLocal || "",
    payload.pageUrl || "",
    getScore(scores, 0),
    getScore(scores, 1),
    getScore(scores, 2),
    getScore(scores, 3),
    getScore(scores, 4),
    getScore(scores, 5),
    payload.comment || "",
    order.size || "",
    order.shape || "",
    order.flavor || "",
    order.style || "",
    order.mood || "",
    order.border || "",
    order.letteringType || "",
    order.topping || "",
    order.color || "",
    order.cream || "",
    order.character || "",
    order.plate || "",
    order.price || "",
    payload.userAgent || "",
  ];
}

function getScore(scores, index) {
  return scores[index] && scores[index].score !== undefined ? scores[index].score : "";
}
