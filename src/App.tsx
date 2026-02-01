import { useState, useEffect, useRef, useCallback } from 'react';
import Cigarette from './components/Cigarette';
import SmokingCompleteModal from './components/SmokingCompleteModal';
import { useFirebase } from './hooks/useFirebase';
import { getTossShareLink, share, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 광고 그룹 ID
const AD_GROUP_ID = 'ait.v2.live.a5a8926d9a4d4e1a';

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
  const [showDailyStats, setShowDailyStats] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);

  // Firebase 연동
  const { stats, activeUsers, dailyStats, setSmokingStatus, addCigarette } = useFirebase();

  // 통계 계산
  const moneySpent = cigaretteCount * PRICE_PER_CIGARETTE;
  const minutesLost = cigaretteCount * MINUTES_LOST_PER_CIGARETTE;

  // 화면 탁해지는 효과 (담배 피우는 동안 점점 탁해짐)
  const smokeOpacity = isBurning ? (burnLevel / 100) * 0.5 : 0;

  // 토스트 메시지
  const [showToast, setShowToast] = useState(false);

  // 광고 로드 상태
  const adLoadedRef = useRef(false);

  // 광고 미리 로드
  const preloadAd = useCallback(() => {
    if (loadFullScreenAd.isSupported()) {
      loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            adLoadedRef.current = true;
          }
        },
        onError: () => {
          adLoadedRef.current = false;
        }
      });
    }
  }, []);

  // 광고 표시
  const showAd = useCallback((onComplete: () => void) => {
    if (showFullScreenAd.isSupported() && adLoadedRef.current) {
      showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'dismissed') {
            adLoadedRef.current = false;
            preloadAd(); // 다음 광고 미리 로드
            onComplete();
          }
        },
        onError: () => {
          adLoadedRef.current = false;
          preloadAd();
          onComplete();
        }
      });
    } else {
      // 앱인토스 환경이 아니거나 광고 로드 안됨
      onComplete();
    }
  }, [preloadAd]);

  // 앱 시작 시 광고 미리 로드
  useEffect(() => {
    preloadAd();
  }, [preloadAd]);

  // 공유 기능
  const handleShare = async () => {
    const shareUrl = 'https://smoketrace.vercel.app';
    const shareText = `🚬 SMOKE TRACE - 담배 한 개비가 남기는 흔적\n오늘 ${cigaretteCount}개비 피워서 ₩${moneySpent.toLocaleString()} 태웠습니다.`;
    try {
      const tossLink = await getTossShareLink(shareUrl);
      await share({ message: `${shareText}\n${tossLink}` });
    } catch {
      // 토스 환경이 아닌 경우
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'SMOKE TRACE',
            text: shareText,
            url: shareUrl,
          });
        } catch { }
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
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
      setIsAutoMode(false); // 자동 모드 중지
      setIsBurning(false); // 피우기 중지

      // 잠시 대기 후 광고 표시, 광고 끝나면 완료 모달
      setTimeout(() => {
        showAd(() => {
          setShowCompleteModal(true);
        });
      }, 500);
    }
  }, [burnLevel, addCigarette, showAd]);

  // 마지막 탭 시간 (더블탭 감지용)
  const lastTapTimeRef = useRef(0);
  const isTouchDeviceRef = useRef(false);

  // 터치 시작
  const handleTouchStart = () => {
    isTouchDeviceRef.current = true;
    handleTap();
  };

  // 마우스 다운 (터치 기기가 아닐 때만)
  const handleMouseDown = () => {
    if (isTouchDeviceRef.current) return;
    handleTap();
  };

  // 공통 탭/클릭 처리
  const handleTap = () => {
    isMouseDownRef.current = true;

    // 자동 모드일 때는 아무 클릭이나 중지
    if (isAutoMode) {
      setIsAutoMode(false);
      setIsBurning(false);
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      lastTapTimeRef.current = 0;
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    // 더블탭 감지 (400ms 이내)
    if (timeSinceLastTap < 400 && timeSinceLastTap > 50) {
      // 더블탭/더블클릭
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      lastTapTimeRef.current = 0;

      // 자동 모드 시작
      setIsAutoMode(true);
      setIsBurning(true);
    } else {
      // 첫 번째 탭
      lastTapTimeRef.current = now;
      clickTimerRef.current = window.setTimeout(() => {
        // 손가락/마우스가 아직 눌려있을 때만 피우기 시작
        if (!isAutoMode && isMouseDownRef.current) {
          setIsBurning(true);
        }
      }, 400);
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
                  onClick={() => { setMenuOpen(false); setShowDailyStats(true); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm">일별 통계</span>
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
          {activeUsers.total}명 피우는 중
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
          onTouchStart={handleTouchStart}
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

      {/* 담배 완료 모달 */}
      <SmokingCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onShare={handleShare}
        moneySpent={moneySpent}
        cigaretteCount={cigaretteCount}
        minutesLost={minutesLost}
        formatTime={formatTime}
      />

      {/* 일별 통계 모달 */}
      {showDailyStats && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowDailyStats(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl w-[320px] max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="bg-orange-500 px-5 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold">일별 통계</h2>
              <button onClick={() => setShowDailyStats(false)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* 콘텐츠 */}
            <div className="p-5 overflow-y-auto max-h-[55vh]">
              <p className="text-gray-400 text-xs mb-4">전체 이용자 기준</p>
              <div className="space-y-3">
                {dailyStats.map((stat) => {
                  const date = new Date(stat.date);
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const isToday = stat.date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={stat.date} className="flex justify-between items-center">
                      <span className={`text-sm ${isToday ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                        {date.getMonth() + 1}/{date.getDate()} ({dayNames[date.getDay()]})
                        {isToday && ' 오늘'}
                      </span>
                      <span className={`font-bold ${isToday ? 'text-orange-500' : 'text-white'}`}>
                        {stat.count.toLocaleString()}개비
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#2c2c2e] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50">
          링크가 복사되었습니다
        </div>
      )}
    </div>
  );
}

export default App;
