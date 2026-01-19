# SMOKE TRACE

담배 한 개비가 남기는 흔적을 시각화하는 교육용 웹앱입니다.

## 기능

- 담배 피우기 시뮬레이션 (꾹 누르기 / 더블클릭 자동 모드)
- 실시간 연기 파티클 효과
- 개인 통계: 피운 개비, 태운 돈, 줄어든 수명
- 실시간 전체 통계: 동시 접속자, 흡연 중인 사용자, 오늘/누적 개비 수

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS
- Firebase Realtime Database
- Vercel (배포)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성하세요.

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase 보안 규칙

```json
{
  "rules": {
    "stats": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['todayCount', 'totalCount', 'lastDate'])",
      "todayCount": { ".validate": "newData.isNumber() && newData.val() >= 0" },
      "totalCount": { ".validate": "newData.isNumber() && newData.val() >= 0" },
      "lastDate": { ".validate": "newData.isString()" }
    },
    "activeUsers": {
      ".read": true,
      "$userId": {
        ".write": true,
        ".validate": "newData.hasChildren(['timestamp', 'isSmoking'])",
        "timestamp": { ".validate": "newData.val() <= now" },
        "isSmoking": { ".validate": "newData.isBoolean()" }
      }
    }
  }
}
```

## 사용 방법

1. 화면 하단 버튼을 **꾹 누르면** 담배가 타기 시작합니다
2. **더블클릭**하면 자동으로 계속 타는 모드가 됩니다
3. 자동 모드 중 **아무 곳이나 클릭**하면 중지됩니다
4. 담배 이미지를 직접 눌러도 피울 수 있습니다

## 통계 기준

- 담배 1개비 = 250원
- 담배 1개비 = 수명 11분 감소 (의학 통계 기반)

