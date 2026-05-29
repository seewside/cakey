# CAKEY 주문제작 케이크 주문서 프론트엔드

설치 없이 실행할 수 있는 정적 프론트엔드입니다.

## 실행 방법

1. 이 폴더에서 터미널을 엽니다.
2. 아래 명령어를 실행합니다.

```powershell
python -m http.server 5173
```

3. 브라우저에서 아래 주소를 엽니다.

```text
http://localhost:5173
```

`index.html`을 직접 더블클릭해도 열리지만, 로컬 서버로 실행하면 이미지와 스크립트 동작을 더 안정적으로 확인할 수 있습니다.

## 만족도 조사 Google Sheets 저장 설정

1. Google Drive에서 Apps Script 프로젝트를 새로 만듭니다.
2. `google-apps-script.js` 내용을 Apps Script 편집기에 붙여넣고 저장합니다.
3. `배포 > 새 배포 > 웹 앱`을 선택합니다.
4. 실행 권한은 본인 계정, 액세스 권한은 `모든 사용자`로 설정해 배포합니다.
5. 발급된 웹 앱 URL을 `survey-config.js`의 `window.CAKEY_SURVEY_WEB_APP_URL` 값에 넣습니다.

설문이 제출되면 지정된 Google 스프레드시트 문서 안의 `cakey_사용자_만족도_데이터` 시트에 응답이 누적됩니다.
