import { useState, useEffect, memo, useCallback } from 'react';

interface CigaretteProps {
  burnLevel: number;
  isBurning: boolean;
  onStartSmoking: () => void;
  onStopSmoking: () => void;
}

interface SmokeParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  opacity: number;
  drift: number;
}

// 파티클을 memo로 최적화
const SmokeParticleComponent = memo(({ particle, top }: { particle: SmokeParticle; top: number }) => (
  <div
    className="absolute rounded-full pointer-events-none will-change-transform"
    style={{
      left: `calc(50% + ${particle.x}px)`,
      top: `${top}px`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: `rgba(180, 180, 180, ${particle.opacity})`,
      boxShadow: `0 0 ${particle.size * 0.8}px ${particle.size * 0.4}px rgba(150, 150, 150, ${particle.opacity * 0.5})`,
      animation: `smokeRise ${particle.duration}s ease-out forwards`,
      '--drift': `${particle.drift}px`,
    } as React.CSSProperties}
  />
));

function Cigarette({ burnLevel, isBurning, onStartSmoking, onStopSmoking }: CigaretteProps) {
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    if (!isBurning) {
      // 즉시 파티클 제거
      setSmokeParticles([]);
      return;
    }

    let particleId = 0;

    // 100ms마다 2개 파티클 생성 (리얼한 연기)
    const interval = setInterval(() => {
      const newParticles: SmokeParticle[] = [];
      for (let i = 0; i < 2; i++) {
        newParticles.push({
          id: particleId++,
          x: (Math.random() - 0.5) * 15,
          size: Math.random() * 8 + 4,
          duration: 2 + Math.random() * 1,
          opacity: 0.3 + Math.random() * 0.2,
          drift: (Math.random() - 0.5) * 60,
        });
      }

      setSmokeParticles(prev => {
        const updated = [...prev, ...newParticles];
        return updated.length > 20 ? updated.slice(-20) : updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isBurning]);

  const cigaretteHeight = 280;
  const filterHeight = 60;
  const burnedHeight = (cigaretteHeight - filterHeight) * (burnLevel / 100);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onStartSmoking();
  }, [onStartSmoking]);

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer select-none touch-none"
      onMouseDown={onStartSmoking}
      onMouseUp={onStopSmoking}
      onMouseLeave={onStopSmoking}
      onTouchStart={handleTouchStart}
      onTouchEnd={onStopSmoking}
    >
      {/* 연기 파티클 (담배 위에 표시) */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {smokeParticles.map(particle => (
          <SmokeParticleComponent
            key={particle.id}
            particle={particle}
            top={burnedHeight - 5}
          />
        ))}
      </div>

      {/* 담배 본체 */}
      <div className="relative" style={{ width: '50px', height: `${cigaretteHeight}px` }}>
        {/* 타는 부분 (빨간 불) */}
        {isBurning && burnLevel < 100 && (
          <div
            className="absolute left-0 right-0 h-3 rounded-t-sm burning"
            style={{
              top: `${burnedHeight}px`,
              background: 'linear-gradient(to bottom, #ff4500, #ff6b35, #333)',
            }}
          />
        )}

        {/* 타버린 부분 (재) */}
        <div
          className="absolute left-0 right-0 top-0 rounded-t-sm"
          style={{
            height: `${burnedHeight}px`,
            background: '#333',
          }}
        />

        {/* 안 탄 담배 부분 */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: `${burnedHeight}px`,
            height: `${cigaretteHeight - filterHeight - burnedHeight}px`,
            background: '#f0f0f0',
            borderLeft: '1px solid #ddd',
            borderRight: '1px solid #ddd',
          }}
        />

        {/* 필터 */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-b-sm"
          style={{
            height: `${filterHeight}px`,
            background: '#d4915a',
            borderLeft: '1px solid #c78550',
            borderRight: '1px solid #c78550',
          }}
        />

        {/* 필터 줄무늬 */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: `${filterHeight - 8}px`,
            height: '2px',
            background: '#c78550',
          }}
        />
      </div>
    </div>
  );
}

export default memo(Cigarette);
