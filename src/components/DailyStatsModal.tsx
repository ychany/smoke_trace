import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DailyStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    dailyStats: Array<{ date: string; count: number }>;
}

const DailyStatsModal = ({ isOpen, onClose, dailyStats }: DailyStatsModalProps) => {
    const totalCount = useMemo(() => {
        return dailyStats.reduce((acc, curr) => acc + curr.count, 0);
    }, [dailyStats]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                }}
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '340px',
                    height: '520px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10,
                }}
            >
                {/* Header */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 24px 16px 24px',
                }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>일별 통계</span>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '20px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: '#d1d5db',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 24px 24px 24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>
                            {totalCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f97316' }}>개비</span>
                    </div>
                    <span style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                    }}>
                        지금까지 피운 담배
                    </span>
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    margin: '0 24px 16px 24px',
                }} />

                {/* Scrollable List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 24px 24px 24px',
                }}>
                    {dailyStats.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '160px',
                            color: '#4b5563',
                        }}>
                            <span style={{ fontSize: '14px' }}>아직 기록이 없습니다</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dailyStats.map((stat) => {
                                const date = new Date(stat.date);
                                const month = date.getMonth() + 1;
                                const day = date.getDate();
                                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                                const dayName = dayNames[date.getDay()];
                                const isToday = stat.date === new Date().toISOString().split('T')[0];

                                return (
                                    <div
                                        key={stat.date}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: isToday ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                                            border: isToday ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: isToday ? '#fed7aa' : '#d1d5db',
                                            }}>
                                                {month}월 {day}일
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: isToday ? '#fb923c' : '#6b7280',
                                            }}>
                                                {dayName}요일
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: isToday ? '#f97316' : 'white',
                                            }}>
                                                {stat.count}
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: isToday ? 'rgba(251,146,60,0.8)' : '#4b5563',
                                            }}>
                                                개비
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Fade */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'linear-gradient(to top, #1a1a1a, transparent)',
                    pointerEvents: 'none',
                }} />
            </motion.div>
        </div>
    );
};

export default DailyStatsModal;
