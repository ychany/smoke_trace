import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RotateCcw, X, AlertTriangle, Clock, Wallet, Cigarette as CigaretteIcon } from 'lucide-react';

interface SmokingCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: () => void;
    moneySpent: number;
    cigaretteCount: number;
    minutesLost: number;
    formatTime: (minutes: number) => string;
}

const SmokingCompleteModal: React.FC<SmokingCompleteModalProps> = ({
    isOpen,
    onClose,
    onShare,
    moneySpent,
    cigaretteCount,
    minutesLost,
    formatTime,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop with blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-[420px] bg-[#121212] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative Gradient Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="px-8 py-20 flex flex-col items-center">
                        {/* Header Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-white/5 shadow-inner mb-14 relative group"
                        >
                            <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse" />
                            <CigaretteIcon size={40} className="text-gray-300 relative z-10" />

                            {/* Smoke Effect (Simple CSS Animation) */}
                            <div className="absolute -top-4 right-4 opacity-50">
                                <div className="w-2 h-2 bg-gray-400 rounded-full blur-sm animate-[ping_3s_linear_infinite]" />
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-white mb-4 tracking-tight"
                        >
                            흡연 완료
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 text-base mb-24"
                        >
                            오늘의 흔적이 기록되었습니다
                        </motion.p>

                        {/* Stats Grid */}
                        <div className="w-full grid grid-cols-2 gap-5 mb-14">
                            {/* Money Spent */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="col-span-2 bg-white/5 border border-white/5 rounded-3xl py-8 px-6 flex items-center justify-between group hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                        <Wallet size={20} />
                                    </div>
                                    <div className="flex flex-col items-start pt-[2px]">
                                        <span className="text-xs text-gray-400">태운 돈</span>
                                        <span className="text-2xl font-bold text-red-400">
                                            ₩{moneySpent.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Cigarettes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white/5 border border-white/5 rounded-3xl py-10 px-4 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400">
                                    <CigaretteIcon size={16} />
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-gray-400 block">피운 개비</span>
                                    <span className="text-lg font-bold text-white">{cigaretteCount}개</span>
                                </div>
                            </motion.div>

                            {/* Life Lost */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-white/5 border border-white/5 rounded-3xl py-10 px-4 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                    <Clock size={16} />
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-gray-400 block">수명 단축</span>
                                    <span className="text-lg font-bold text-orange-400">
                                        {formatTime(minutesLost)}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Warning Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center gap-2 text-sm text-gray-500 mb-20 bg-black/20 py-3 px-6 rounded-full"
                        >
                            <AlertTriangle size={12} className="text-red-500" />
                            <span>방금 11분의 소중한 시간이 사라졌습니다.</span>
                        </motion.div>

                        {/* Buttons */}
                        <div className="w-full flex flex-col gap-5">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose} // "One more" just closes modal to let them smoke again
                                className="w-full py-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-white text-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                <span>다시 피우기</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onClose();
                                    onShare();
                                }}
                                className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl font-medium text-gray-300 text-lg hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                <span>공유하기</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SmokingCompleteModal;
