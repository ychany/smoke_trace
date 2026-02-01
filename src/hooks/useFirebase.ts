import { useState, useEffect, useRef } from 'react';
import {
  registerPresence,
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
}

interface DailyStat {
  date: string;
  count: number;
}

export function useFirebase() {
  const [stats, setStats] = useState<Stats>({ todayCount: 0, totalCount: 0 });
  const [activeUsers, setActiveUsers] = useState<ActiveUsers>({ total: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatRef = useRef<number | null>(null);

  // 초기화 및 구독
  useEffect(() => {
    // 접속 등록
    registerPresence();
    setIsConnected(true);

    // 즉시 타임스탬프 갱신 (초기 접속 시)
    set(userRef, {
      timestamp: serverTimestamp()
    });

    // Heartbeat - 15초마다 타임스탬프 갱신
    heartbeatRef.current = window.setInterval(() => {
      set(userRef, {
        timestamp: serverTimestamp()
      });
    }, 15000);

    // 통계 구독
    const unsubStats = subscribeToStats((newStats) => {
      setStats(newStats);
    });

    // 활성 사용자 구독
    const unsubUsers = subscribeToActiveUsers((total) => {
      setActiveUsers({ total });
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

  // 담배 다 피웠을 때 카운트 증가
  const addCigarette = () => {
    incrementCigaretteCount();
  };

  return {
    stats,
    activeUsers,
    dailyStats,
    isConnected,
    addCigarette
  };
}
