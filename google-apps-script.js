const SPREADSHEET_ID = "1Dwlh8sDwvU3-z2KX37iBAdOLcHYlztXTYwHfgc6-HxE";
const SHEET_NAME = "cakey_사용자_만족도_데이터";

const HEADERS = [
  "저장일시(KST)",
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
  "추천 crop ID",
  "추천 가게명",
  "AI 수정 이미지 URL",
  "캐릭터 참고 이미지 URL",
  "브라우저",
];

function doPost(event) {
  return savePayload(parsePayload(event));
}

function doGet(event) {
  try {
    if (event && event.parameter && event.parameter.payload) {
      return savePayload(parsePayload(event));
    }

    const sheet = getSurveySheet();

    return jsonResponse({
      ok: true,
      message: "CAKEY survey endpoint is ready. Submit survey responses with payload.",
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

function savePayload(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSurveySheet();
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([toRow(payload)]);

    return jsonResponse({
      ok: true,
      row: nextRow,
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
  } finally {
    lock.releaseLock();
  }
}

function parsePayload(event) {
  if (event.parameter && event.parameter.payload) {
    return JSON.parse(event.parameter.payload);
  }

  const contents = event.postData && event.postData.contents ? event.postData.contents : "{}";
  if (contents.indexOf("payload=") === 0) {
    return JSON.parse(decodeURIComponent(contents.replace(/^payload=/, "").replace(/\+/g, " ")));
  }

  return JSON.parse(contents || "{}");
}

function getSurveySheet() {
  const spreadsheet = openTargetSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaderRow(sheet);

  return sheet;
}

function ensureHeaderRow(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const shouldUpdateHeaders = HEADERS.some((header, index) => currentHeaders[index] !== header);

  if (shouldUpdateHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function openTargetSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    throw new Error(
      "SPREADSHEET_ID must point to a native Google Sheets spreadsheet. Original error: " + error.message
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
    Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
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
    order.recommendedCakeCropId || "",
    order.recommendedShopName || "",
    order.generatedCustomizeImageUrl || "",
    order.characterReferenceImageUrl || "",
    payload.userAgent || "",
  ];
}

function getScore(scores, index) {
  return scores[index] && scores[index].score !== undefined ? scores[index].score : "";
}
