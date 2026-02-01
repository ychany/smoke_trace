import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, onDisconnect, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDOd7yV2mjloHu7qbkWyr47C7YwlxzxTLc",
  authDomain: "smoke-trace.firebaseapp.com",
  databaseURL: "https://smoke-trace-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smoke-trace",
  storageBucket: "smoke-trace.firebasestorage.app",
  messagingSenderId: "886550984496",
  appId: "1:886550984496:web:3bde568dc28a37e72a3af5",
  measurementId: "G-2LRHXKVWPW"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 고유 사용자 ID 생성
const getUserId = () => {
  let id = localStorage.getItem('smoke_trace_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('smoke_trace_user_id', id);
  }
  return id;
};

export const userId = getUserId();

// 참조
export const statsRef = ref(db, 'stats');
export const dailyStatsRef = ref(db, 'dailyStats');
export const activeUsersRef = ref(db, 'activeUsers');
export const userRef = ref(db, `activeUsers/${userId}`);

// 접속 등록 및 해제
export const registerPresence = () => {
  // 현재 접속 등록
  set(userRef, {
    timestamp: serverTimestamp(),
    isSmoking: false
  });

  // 연결 해제 시 자동 삭제
  onDisconnect(userRef).remove();
};

// 흡연 상태 업데이트
export const updateSmokingStatus = (isSmoking: boolean) => {
  set(userRef, {
    timestamp: serverTimestamp(),
    isSmoking
  });
};

// 담배 카운트 증가
export const incrementCigaretteCount = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 현재 통계 가져오기
  const snapshot = await get(statsRef);
  const stats = snapshot.val() || { todayCount: 0, totalCount: 0, lastDate: today };

  // 날짜가 바뀌었으면 todayCount 리셋
  if (stats.lastDate !== today) {
    await set(statsRef, {
      todayCount: 1,
      totalCount: (stats.totalCount || 0) + 1,
      lastDate: today
    });
  } else {
    await set(statsRef, {
      todayCount: (stats.todayCount || 0) + 1,
      totalCount: (stats.totalCount || 0) + 1,
      lastDate: today
    });
  }

  // 일별 통계에도 저장
  const dailyRef = ref(db, `dailyStats/${today}`);
  const dailySnapshot = await get(dailyRef);
  const dailyCount = dailySnapshot.val() || 0;
  await set(dailyRef, dailyCount + 1);
};

// 실시간 통계 구독
export const subscribeToStats = (callback: (stats: { todayCount: number; totalCount: number }) => void) => {
  return onValue(statsRef, (snapshot) => {
    const stats = snapshot.val() || { todayCount: 0, totalCount: 0, lastDate: '' };
    const today = new Date().toISOString().split('T')[0];

    // 날짜가 다르면 todayCount는 0으로 표시
    if (stats.lastDate !== today) {
      callback({ todayCount: 0, totalCount: stats.totalCount || 0 });
    } else {
      callback({ todayCount: stats.todayCount || 0, totalCount: stats.totalCount || 0 });
    }
  });
};

// 실시간 활성 사용자 구독
export const subscribeToActiveUsers = (callback: (count: number, smokingCount: number) => void) => {
  return onValue(activeUsersRef, (snapshot) => {
    const users = snapshot.val() || {};
    const now = Date.now();
    let activeCount = 0;
    let smokingCount = 0;

    Object.values(users).forEach((user: any) => {
      // 30초 이내 활동한 사용자만 카운트
      if (user.timestamp && (now - user.timestamp) < 30000) {
        activeCount++;
        if (user.isSmoking) {
          smokingCount++;
        }
      }
    });

    callback(activeCount, smokingCount);
  });
};

// 일별 통계 구독 (2026-02-01부터 오늘까지, 최신순)
export const subscribeToDailyStats = (callback: (dailyStats: { date: string; count: number }[]) => void) => {
  return onValue(dailyStatsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const result: { date: string; count: number }[] = [];

    // 시작일: 2026-02-01
    const startDate = new Date('2026-02-01');
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘부터 시작일까지 모든 날짜 (최신순)
    const currentDate = new Date(today);
    while (currentDate >= startDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      result.push({
        date: dateStr,
        count: data[dateStr] || 0
      });

      currentDate.setDate(currentDate.getDate() - 1);
    }

    callback(result);
  });
};

export { db };
