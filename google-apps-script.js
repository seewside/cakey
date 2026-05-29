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
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const sheet = getSurveySheet();
    sheet.appendRow(toRow(payload));

    return jsonResponse({
      ok: true,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: sheet.getParent().getUrl(),
      sheetName: sheet.getName(),
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      spreadsheetId: SPREADSHEET_ID,
      message: error.message,
    });
  }
}

function doGet() {
  try {
    const sheet = getSurveySheet();

    return jsonResponse({
      ok: true,
      message: "CAKEY survey endpoint is ready. Submit survey responses with POST.",
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: sheet.getParent().getUrl(),
      sheetName: sheet.getName(),
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      spreadsheetId: SPREADSHEET_ID,
      message: error.message,
    });
  }
}

function getSurveySheet() {
  const spreadsheet = openTargetSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function openTargetSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    throw new Error(
      "Target document must be a native Google Sheets spreadsheet. " +
      "Open the linked Excel file in Google Sheets and convert it with File > Save as Google Sheets, " +
      "then redeploy this script with the converted spreadsheet ID. Original error: " + error.message
    );
  }
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
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
