import { useState, useEffect, useRef } from 'react';
import Cigarette from './components/Cigarette';

// 상수
const PRICE_PER_CIGARETTE = 250; // 원
const MINUTES_LOST_PER_CIGARETTE = 11; // 분
const BURN_INTERVAL = 200; // ms - 누르고 있을 때 타는 속도
const BURN_AMOUNT = 1; // 한 번에 타는 양

function App() {
  const [cigaretteCount, setCigaretteCount] = useState(0);
  const [burnLevel, setBurnLevel] = useState(0);
  const [isBurning, setIsBurning] = useState(false);
  const intervalRef = useRef<number | null>(null);

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
          if (prev >= 100) {
            // 담배 다 탔으면 새 담배
            setCigaretteCount(c => c + 1);
            return 0;
          }
          return Math.min(100, prev + BURN_AMOUNT);
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

  // 누르기 시작
  const startSmoking = () => {
    setIsBurning(true);
  };

  // 누르기 끝
  const stopSmoking = () => {
    setIsBurning(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-between px-4 py-12">
      {/* 헤더 */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-wider mb-2">
          SMOKE TRACE
        </h1>
        <p className="text-gray-400 text-sm">한 개비가 남기는 흔적</p>
      </header>

      {/* 담배 */}
      <main className="flex items-center justify-center">
        <Cigarette burnLevel={burnLevel} isBurning={isBurning} />
      </main>

      {/* 하단 영역 */}
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {/* 통계 */}
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
          onMouseDown={startSmoking}
          onMouseUp={stopSmoking}
          onMouseLeave={stopSmoking}
          onTouchStart={startSmoking}
          onTouchEnd={stopSmoking}
          className={`w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 select-none ${isBurning ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}
        >
          🔥 {isBurning ? '피우는 중...' : '꾹 눌러서 담배 피우기'}
        </button>

        {/* 푸터 */}
        <p className="text-gray-600 text-xs text-center">
          * 1개비당 약 ₩250, 수명 11분 감소 (의학 통계 기반)
        </p>
      </div>
    </div>
  );
}

export default App;
