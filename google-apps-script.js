const SPREADSHEET_ID = "1Dwlh8sDwvU3-z2KX37iBAdOLcHYlztXTYwHfgc6-HxE";
const SHEET_NAME = "cakey_사용자_만족도_데이터";
const ORDER_SHEET_NAME = "cakey_주문_아카이브";
const ORDER_DRIVE_FOLDER_ID = "1g9aPn9RHymCa-ITd3OnWWqTaGn38bbjE";

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
  "판 레터링 문구",
  "가격",
  "추천 crop ID",
  "추천 가게명",
  "AI 수정 이미지 URL",
  "캐릭터 참고 이미지 URL",
  "브라우저",
];

const ORDER_HEADERS = [
  "저장일시(KST)",
  "주문번호",
  "페이지",
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
  "판 레터링 문구",
  "가격",
  "픽업 날짜",
  "픽업 시간",
  "주문자명",
  "연락처",
  "주문 메모",
  "문구",
  "추가 변경 요청",
  "캐릭터 설명",
  "추천 crop ID",
  "추천 가게명",
  "추천 이미지 원본 URL",
  "AI 생성 이미지 원본 URL",
  "Drive 추천 이미지",
  "Drive AI 생성 이미지",
  "브라우저",
];

function doPost(event) {
  const payload = parsePayload(event);
  if (payload.mode === "order_archive") {
    return saveOrderArchive(payload);
  }
  return savePayload(payload);
}

function doGet(event) {
  try {
    if (event && event.parameter && event.parameter.payload) {
      const payload = parsePayload(event);
      if (payload.mode === "order_archive") {
        return saveOrderArchive(payload);
      }
      if (payload.mode === "list_orders") {
        return listOrderArchives();
      }
      if (payload.mode === "get_order") {
        return getOrderArchive(payload.orderId || payload.order_id || "");
      }
      return savePayload(payload);
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

function listOrderArchives() {
  try {
    const orders = readOrderArchiveRows();
    return jsonResponse({
      ok: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message,
    });
  }
}

function getOrderArchive(orderId) {
  try {
    const order = readOrderArchiveRows().find((row) => row.order_id === orderId);
    if (!order) {
      return jsonResponse({
        ok: false,
        message: "order not found",
      });
    }
    return jsonResponse({
      ok: true,
      order,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message,
    });
  }
}

function readOrderArchiveRows() {
  const sheet = getOrderSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1)
    .map((row) => normalizeOrderArchiveRow(headers, row))
    .filter((row) => row.order_id);
}

function normalizeOrderArchiveRow(headers, row) {
  const raw = {};
  headers.forEach((header, index) => {
    raw[header] = row[index] === undefined || row[index] === null ? "" : String(row[index]);
  });

  return {
    saved_at: raw["저장일시(KST)"] || "",
    order_id: raw["주문번호"] || "",
    page_url: raw["페이지"] || "",
    size: raw["사이즈"] || "",
    shape: raw["모양"] || "",
    flavor: raw["맛"] || "",
    style: raw["스타일"] || "",
    mood: raw["무드"] || "",
    border: raw["테두리"] || "",
    lettering_type: raw["레터링 타입"] || "",
    topping: raw["토핑"] || "",
    color: raw["색상"] || "",
    cream: raw["크림 데코"] || "",
    character: raw["캐릭터"] || "",
    plate: raw["판 레터링"] || "",
    plate_lettering_text: raw["판 레터링 문구"] || "",
    price: raw["가격"] || "",
    pickup_date: raw["픽업 날짜"] || "",
    pickup_time: raw["픽업 시간"] || "",
    customer_name: raw["주문자명"] || "",
    customer_phone: raw["연락처"] || "",
    order_memo: raw["주문 메모"] || "",
    lettering_text: raw["문구"] || "",
    extra_request: raw["추가 변경 요청"] || "",
    character_description: raw["캐릭터 설명"] || "",
    recommended_cake_crop_id: raw["추천 crop ID"] || "",
    recommended_shop_name: raw["추천 가게명"] || "",
    recommended_crop_image_url: raw["추천 이미지 원본 URL"] || "",
    generated_customize_image_url: raw["AI 생성 이미지 원본 URL"] || "",
    archive_recommended_view_url: raw["Drive 추천 이미지"] || "",
    archive_generated_view_url: raw["Drive AI 생성 이미지"] || "",
    user_agent: raw["브라우저"] || "",
    recommended_original_image_url: "",
    drive_recommended_error: "",
    drive_generated_error: "",
    archive_error: "",
    character_reference_image_url: "",
  };
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

function getOrderSheet() {
  const spreadsheet = openTargetSpreadsheet();
  const sheet = spreadsheet.getSheetByName(ORDER_SHEET_NAME) || spreadsheet.insertSheet(ORDER_SHEET_NAME);
  ensureHeaderRowWithHeaders(sheet, ORDER_HEADERS);

  return sheet;
}

function ensureHeaderRow(sheet) {
  ensureHeaderRowWithHeaders(sheet, HEADERS);
}

function ensureHeaderRowWithHeaders(sheet, headers) {
  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const shouldUpdateHeaders = headers.some((header, index) => currentHeaders[index] !== header);

  if (shouldUpdateHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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
    order.plateLetteringText || order.plate_lettering_text || "",
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

function saveOrderArchive(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const folder = DriveApp.getFolderById(ORDER_DRIVE_FOLDER_ID);
    const order = payload.order || {};
    const orderId = payload.orderId || makeOrderId();
    const recommended = saveRemoteImage(folder, orderId, "recommended", order.recommendedCropImageUrl);
    const generated = saveRemoteImage(folder, orderId, "generated", order.generatedCustomizeImageUrl);
    const sheet = getOrderSheet();
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, ORDER_HEADERS.length).setValues([
      toOrderRow(payload, orderId, recommended, generated),
    ]);

    return jsonResponse({
      ok: true,
      orderId,
      row: nextRow,
      recommendedDriveUrl: recommended.url,
      generatedDriveUrl: generated.url,
      recommendedFileId: recommended.fileId,
      generatedFileId: generated.fileId,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message,
    });
  } finally {
    lock.releaseLock();
  }
}

function toOrderRow(payload, orderId, recommended, generated) {
  const order = payload.order || {};
  return [
    Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
    orderId,
    payload.pageUrl || "",
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
    order.plateLetteringText || order.plate_lettering_text || "",
    order.price || "",
    order.pickupDate || "",
    order.pickupTime || "",
    order.customerName || "",
    order.customerPhone || "",
    order.orderMemo || "",
    order.letteringText || "",
    order.extraRequest || "",
    order.characterDescription || "",
    order.recommendedCakeCropId || "",
    order.recommendedShopName || "",
    order.recommendedCropImageUrl || "",
    order.generatedCustomizeImageUrl || "",
    recommended.url || "",
    generated.url || "",
    payload.userAgent || "",
  ];
}

function saveRemoteImage(folder, orderId, label, url) {
  if (!url) {
    return { fileId: "", url: "" };
  }

  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(label + " image download failed: HTTP " + status);
  }

  const headers = response.getHeaders();
  const contentType = headers["Content-Type"] || headers["content-type"] || "image/webp";
  const extension = extensionFromContentType(contentType);
  const blob = response.getBlob()
    .setContentType(contentType)
    .setName(orderId + "_" + label + extension);
  const file = folder.createFile(blob);

  return {
    fileId: file.getId(),
    url: file.getUrl(),
  };
}

function extensionFromContentType(contentType) {
  if (contentType.indexOf("png") !== -1) return ".png";
  if (contentType.indexOf("jpeg") !== -1 || contentType.indexOf("jpg") !== -1) return ".jpg";
  if (contentType.indexOf("webp") !== -1) return ".webp";
  return ".img";
}

function makeOrderId() {
  return "cakey_" + Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd_HHmmss");
}
