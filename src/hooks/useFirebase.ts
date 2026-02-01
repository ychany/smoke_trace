import { useState, useEffect, useRef } from 'react';
import {
  registerPresence,
  updateSmokingStatus,
  incrementCigaretteCount,
  subscribeToStats,
  subscribeToActiveUsers,
  subscribeToDailyStats,
  userRef
} from '../firebase';
import { set, serverTimestamp } from 'firebase/database';

interface Stats {
  todayCount: number;
  totalCount: number;
}

interface ActiveUsers {
  total: number;
  smoking: number;
}

interface DailyStat {
  date: string;
  count: number;
}

export function useFirebase() {
  const [stats, setStats] = useState<Stats>({ todayCount: 0, totalCount: 0 });
  const [activeUsers, setActiveUsers] = useState<ActiveUsers>({ total: 0, smoking: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatRef = useRef<number | null>(null);

  // 초기화 및 구독
  useEffect(() => {
    // 접속 등록
    registerPresence();
    setIsConnected(true);

    // Heartbeat - 10초마다 타임스탬프 갱신
    heartbeatRef.current = window.setInterval(() => {
      set(userRef, {
        timestamp: serverTimestamp(),
        isSmoking: false
      });
    }, 10000);

    // 통계 구독
    const unsubStats = subscribeToStats((newStats) => {
      setStats(newStats);
    });

    // 활성 사용자 구독
    const unsubUsers = subscribeToActiveUsers((total, smoking) => {
      setActiveUsers({ total, smoking });
    });

    // 일별 통계 구독
    const unsubDaily = subscribeToDailyStats((daily) => {
      setDailyStats(daily);
    });

    // 정리
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      unsubStats();
      unsubUsers();
      unsubDaily();
    };
  }, []);

  // 흡연 상태 업데이트
  const setSmokingStatus = (isSmoking: boolean) => {
    updateSmokingStatus(isSmoking);
  };

  // 담배 다 피웠을 때 카운트 증가
  const addCigarette = () => {
    incrementCigaretteCount();
  };

  return {
    stats,
    activeUsers,
    dailyStats,
    isConnected,
    setSmokingStatus,
    addCigarette
  };
}
