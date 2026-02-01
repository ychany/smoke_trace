import { motion } from 'framer-motion';
import { Share2, RotateCcw, X, Clock, Wallet, Cigarette as CigaretteIcon } from 'lucide-react';

interface SmokingCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: () => void;
    moneySpent: number;
    cigaretteCount: number;
    minutesLost: number;
    formatTime: (minutes: number) => string;
}

const SmokingCompleteModal = ({
    isOpen,
    onClose,
    onShare,
    moneySpent,
    cigaretteCount,
    minutesLost,
    formatTime,
}: SmokingCompleteModalProps) => {
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
                padding: '24px',
            }}
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '340px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    zIndex: 10,
                }}
            >
                {/* Header */}
                <div style={{ paddingTop: '40px', paddingBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 20px auto',
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <CigaretteIcon size={28} color="#fb923c" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        흡연 완료
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        오늘의 흔적이 기록되었습니다
                    </p>
                </div>

                {/* Stats */}
                <div style={{ padding: '0 24px' }}>
                    {/* 태운 돈 */}
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Wallet size={18} color="#f87171" />
                            </div>
                            <span style={{ fontSize: '14px', color: '#9ca3af' }}>태운 돈</span>
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>
                            ₩{moneySpent.toLocaleString()}
                        </span>
                    </div>

                    {/* 피운 개비 & 수명 단축 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                margin: '0 auto 16px auto',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(107,114,128,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CigaretteIcon size={18} color="#9ca3af" />
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>피운 개비</p>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{cigaretteCount}개</p>
                        </div>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                margin: '0 auto 16px auto',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(249,115,22,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Clock size={18} color="#fb923c" />
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>수명 단축</p>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#fb923c' }}>{formatTime(minutesLost)}</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ padding: '32px 24px 24px 24px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(90deg, #f97316, #ef4444)',
                            borderRadius: '16px',
                            fontWeight: '600',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        <RotateCcw size={18} />
                        다시 피우기
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <button
                            onClick={onShare}
                            style={{
                                padding: '16px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                fontWeight: '500',
                                color: '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            <Share2 size={18} />
                            공유
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '16px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                fontWeight: '500',
                                color: '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            <X size={18} />
                            닫기
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SmokingCompleteModal;
