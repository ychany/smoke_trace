import { useState, useEffect } from 'react';

interface CigaretteProps {
  burnLevel: number; // 0-100, 100 = 완전히 탐
  isBurning: boolean;
  onStartSmoking: () => void;
  onStopSmoking: () => void;
}

interface SmokeParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

export default function Cigarette({ burnLevel, isBurning, onStartSmoking, onStopSmoking }: CigaretteProps) {
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    if (isBurning) {
      const interval = setInterval(() => {
        // 한 번에 2-3개의 파티클 생성
        const particleCount = Math.floor(Math.random() * 2) + 2;
        const newParticles: SmokeParticle[] = [];

        for (let i = 0; i < particleCount; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: (Math.random() - 0.5) * 30,
            size: Math.random() * 15 + 10,
            duration: Math.random() * 2 + 2.5,
            delay: Math.random() * 0.3,
            opacity: Math.random() * 0.3 + 0.2,
            drift: (Math.random() - 0.5) * 60,
          });
        }

        setSmokeParticles(prev => [...prev, ...newParticles]);

        // 파티클 제거
        newParticles.forEach(p => {
          setTimeout(() => {
            setSmokeParticles(prev => prev.filter(particle => particle.id !== p.id));
          }, (p.duration + p.delay) * 1000);
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // 피우기 멈추면 파티클 서서히 제거
      const timeout = setTimeout(() => {
        setSmokeParticles([]);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isBurning]);

  const cigaretteHeight = 280;
  const filterHeight = 60;
  const burnedHeight = (cigaretteHeight - filterHeight) * (burnLevel / 100);

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer select-none"
      onMouseDown={onStartSmoking}
      onMouseUp={onStopSmoking}
      onMouseLeave={onStopSmoking}
      onTouchStart={onStartSmoking}
      onTouchEnd={onStopSmoking}
    >
      {/* 연기 파티클 - 담배 타는 부분 바로 위에서 시작 */}
      {smokeParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            top: `${burnedHeight - 5}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, rgba(180, 180, 180, ${particle.opacity}) 0%, rgba(150, 150, 150, ${particle.opacity * 0.5}) 40%, transparent 70%)`,
            animation: `smokeRise ${particle.duration}s ease-out ${particle.delay}s forwards`,
            '--drift': `${particle.drift}px`,
            filter: 'blur(3px)',
            zIndex: 10,
          } as React.CSSProperties}
        />
      ))}

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
            background: 'linear-gradient(to bottom, #2a2a2a, #3a3a3a)',
          }}
        />

        {/* 안 탄 담배 부분 */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: `${burnedHeight}px`,
            height: `${cigaretteHeight - filterHeight - burnedHeight}px`,
            background: 'linear-gradient(to right, #f5f5f5, #e8e8e8, #f5f5f5)',
            borderLeft: '1px solid #ddd',
            borderRight: '1px solid #ddd',
          }}
        />

        {/* 필터 */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-b-sm"
          style={{
            height: `${filterHeight}px`,
            background: 'linear-gradient(to right, #e8a86b, #d4915a, #e8a86b)',
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
