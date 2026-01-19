import { useState, useEffect } from 'react';

interface CigaretteProps {
  burnLevel: number; // 0-100, 100 = 완전히 탐
  isBurning: boolean;
}

interface SmokeParticle {
  id: number;
  left: number;
}

export default function Cigarette({ burnLevel, isBurning }: CigaretteProps) {
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    if (isBurning) {
      const interval = setInterval(() => {
        const newParticle: SmokeParticle = {
          id: Date.now(),
          left: Math.random() * 20 - 10,
        };
        setSmokeParticles(prev => [...prev, newParticle]);

        // 2초 후 파티클 제거
        setTimeout(() => {
          setSmokeParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 2000);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isBurning]);

  const cigaretteHeight = 280;
  const filterHeight = 60;
  const burnedHeight = (cigaretteHeight - filterHeight) * (burnLevel / 100);

  return (
    <div className="relative flex flex-col items-center">
      {/* 연기 파티클 */}
      <div className="absolute -top-8 left-1/2 w-20 h-32 -translate-x-1/2">
        {smokeParticles.map(particle => (
          <div
            key={particle.id}
            className="smoke-particle"
            style={{ left: `calc(50% + ${particle.left}px)` }}
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
