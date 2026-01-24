import { useState, useEffect, useRef } from 'react';
import Cigarette from './components/Cigarette';
import { useFirebase } from './hooks/useFirebase';
import { getTossShareLink, share } from '@apps-in-toss/web-framework';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);

  // Firebase 연동1
  const { stats, activeUsers, setSmokingStatus, addCigarette } = useFirebase();

  // 통계 계산
  const moneySpent = cigaretteCount * PRICE_PER_CIGARETTE;
  const minutesLost = cigaretteCount * MINUTES_LOST_PER_CIGARETTE;

  // 화면 탁해지는 효과 (담배 피우는 동안 점점 탁해짐)
  const smokeOpacity = isBurning ? (burnLevel / 100) * 0.5 : 0;

  // 공유 기능
  const handleShare = async () => {
    const shareText = `🚬 SMOKE TRACE - 담배 한 개비가 남기는 흔적\n오늘 ${cigaretteCount}개비 피워서 ₩${moneySpent.toLocaleString()} 태웠습니다.`;
    try {
      const tossLink = await getTossShareLink('intoss://smoketrace');
      await share({ message: `${shareText}\n${tossLink}` });
    } catch {
      // 토스 환경이 아닌 경우
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'SMOKE TRACE',
            text: shareText,
            url: window.location.href,
          });
        } catch {}
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        alert('링크가 복사되었습니다!');
      }
    }
  };

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
    isMouseDownRef.current = true;

    // 자동 모드일 때는 아무 클릭이나 중지
    if (isAutoMode) {
      setIsAutoMode(false);
      setIsBurning(false);
      clickCountRef.current = 0;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      return;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // 첫 번째 클릭 - 200ms 내에 두 번째 클릭이 오는지 확인
      clickTimerRef.current = window.setTimeout(() => {
        // 싱글 클릭으로 처리
        clickCountRef.current = 0;
        // 마우스가 아직 눌려있을 때만 피우기 시작
        if (!isAutoMode && isMouseDownRef.current) {
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
    isMouseDownRef.current = false;
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 px-4 py-8 relative">
      {/* 연기 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundColor: `rgba(80, 60, 40, ${smokeOpacity})`,
          backdropFilter: smokeOpacity > 0 ? `blur(${smokeOpacity * 2}px)` : 'none'
        }}
      />

      {/* 좌측 상단 버튼들 */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {/* 메뉴 버튼 */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shadow-md hover:bg-white/20 transition-all active:scale-95"
            aria-label="메뉴"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 mt-2 w-44 bg-gray-900/95 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors w-full"
                  onClick={() => { setMenuOpen(false); setShowPatchNotes(true); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">패치노트</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shadow-md hover:bg-white/20 transition-all active:scale-95"
          aria-label="공유"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

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

      {/* 패치노트 모달 */}
      {showPatchNotes && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowPatchNotes(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl w-[320px] max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="bg-orange-500 px-5 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold">패치노트</h2>
              <button onClick={() => setShowPatchNotes(false)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* 콘텐츠 */}
            <div className="p-5 overflow-y-auto max-h-[55vh]">
              <p className="text-orange-500 font-semibold text-sm mb-3">2026.01.20</p>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• SMOKE TRACE 최초 출시</li>
                <li>• 담배 피우기 시뮬레이션</li>
                <li>• 실시간 연기 파티클 효과</li>
                <li>• 개인/전체 통계 기능</li>
                <li>• Firebase 실시간 연동</li>
                <li>• 더블클릭 자동 모드</li>
                <li>• 화면 탁해지는 효과</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
