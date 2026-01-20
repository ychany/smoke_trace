import { useState, useEffect, useRef } from 'react';
import Cigarette from './components/Cigarette';
import { useFirebase } from './hooks/useFirebase';

// 상수
const PRICE_PER_CIGARETTE = 225; // 원
const MINUTES_LOST_PER_CIGARETTE = 11; // 분
const BURN_INTERVAL = 150; // ms - 누르고 있을 때 타는 속도
const BURN_AMOUNT = 1; // 한 번에 타는 양 (15초 = 100번 x 150ms)

function App() {
  const [cigaretteCount, setCigaretteCount] = useState(0);
  const [burnLevel, setBurnLevel] = useState(0);
  const [isBurning, setIsBurning] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  // Firebase 연동
  const { stats, activeUsers, setSmokingStatus, addCigarette } = useFirebase();

  // 통계 계산
  const moneySpent = cigaretteCount * PRICE_PER_CIGARETTE;
  const minutesLost = cigaretteCount * MINUTES_LOST_PER_CIGARETTE;

  // 시간 포맷팅
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}시간 ${mins}분`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}일 ${remainingHours}시간`;
  };

  // 담배 타는 로직
  useEffect(() => {
    if (isBurning) {
      intervalRef.current = window.setInterval(() => {
        setBurnLevel(prev => {
          const next = prev + BURN_AMOUNT;
          if (next >= 100) {
            return 100; // 일단 100으로 설정
          }
          return next;
        });
      }, BURN_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBurning]);

  // 흡연 상태 Firebase에 업데이트
  useEffect(() => {
    setSmokingStatus(isBurning);
  }, [isBurning, setSmokingStatus]);

  // 담배가 다 타면 카운트 증가 및 리셋
  useEffect(() => {
    if (burnLevel >= 100) {
      setCigaretteCount(c => c + 1);
      addCigarette(); // Firebase에 카운트 증가
      setBurnLevel(0);
    }
  }, [burnLevel, addCigarette]);

  // 클릭 핸들러 (더블클릭 감지 포함)
  const handleMouseDown = () => {
    // 자동 모드일 때는 아무 클릭이나 중지
    if (isAutoMode) {
      setIsAutoMode(false);
      setIsBurning(false);
      return;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // 첫 번째 클릭 - 200ms 내에 두 번째 클릭이 오는지 확인
      clickTimerRef.current = window.setTimeout(() => {
        // 싱글 클릭으로 처리
        clickCountRef.current = 0;
        if (!isAutoMode) {
          setIsBurning(true);
        }
      }, 200);
    } else if (clickCountRef.current === 2) {
      // 더블클릭
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      clickCountRef.current = 0;

      // 자동 모드 시작
      setIsAutoMode(true);
      setIsBurning(true);
    }
  };

  // 누르기 끝
  const stopSmoking = () => {
    if (!isAutoMode && clickCountRef.current === 0) {
      setIsBurning(false);
    }
  };

  // 담배 직접 누르기 (단순 누르고 있는 동안만)
  const startDirectSmoking = () => {
    if (!isAutoMode) {
      setIsBurning(true);
    }
  };

  const stopDirectSmoking = () => {
    if (!isAutoMode) {
      setIsBurning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-between px-4 py-8">
      {/* 헤더 */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-wider mb-2">
          SMOKE TRACE
        </h1>
        <p className="text-gray-400 text-sm">한 개비가 남기는 흔적</p>
      </header>

      {/* 실시간 통계 */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${activeUsers.smoking > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
          {activeUsers.smoking > 0 ? `${activeUsers.smoking}명 피우는 중` : `${activeUsers.total}명 접속 중`}
        </span>
        <span>|</span>
        <span>오늘 {stats.todayCount.toLocaleString()}개비</span>
        <span>|</span>
        <span>누적 {stats.totalCount.toLocaleString()}개비</span>
      </div>

      {/* 담배 */}
      <main className="flex items-center justify-center">
        <Cigarette
          burnLevel={burnLevel}
          isBurning={isBurning}
          onStartSmoking={startDirectSmoking}
          onStopSmoking={stopDirectSmoking}
        />
      </main>

      {/* 하단 영역 */}
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {/* 개인 통계 */}
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="flex items-center gap-2">
            <span>🚬</span>
            <span>피운 개비: <strong className="text-white">{cigaretteCount}개</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>💸</span>
            <span>태운 돈: <strong className="text-red-400">₩{moneySpent.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>줄어든 수명: <strong className="text-orange-400">{formatTime(minutesLost)}</strong></span>
          </div>
        </div>

        {/* 버튼 */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={stopSmoking}
          onMouseLeave={stopSmoking}
          onTouchStart={handleMouseDown}
          onTouchEnd={stopSmoking}
          className={`w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 select-none ${isBurning ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}
        >
          {isAutoMode ? '🔥 자동 피우는 중... (클릭하여 중지)' : isBurning ? '🔥 피우는 중...' : '🔥 꾹 눌러서 피우기 (더블클릭: 자동)'}
        </button>

        {/* 푸터 */}
        <p className="text-gray-600 text-xs text-center">
          * 1개비당 약 ₩225, 수명 11분 감소
        </p>
        <p className="text-gray-700 text-xs text-center">
          © 2026 JO YEONG CHAN. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default App;
