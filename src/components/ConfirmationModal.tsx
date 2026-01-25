'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = 'はい',
    cancelText = 'キャンセル',
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="glass-panel rounded-2xl p-6 max-w-sm mx-4 text-center border border-white/10"
                >
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/20"
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
