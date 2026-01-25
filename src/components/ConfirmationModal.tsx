'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-sm px-4"
                >
                    <Card variant="default" className="p-6 bg-black/90 border-white/10">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center border border-red-500/30">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>

                        <h3 className="text-xl font-display font-bold text-white mb-2 text-center">{title}</h3>
                        <p className="text-text-secondary mb-8 text-sm leading-relaxed text-center">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="ghost" onClick={onCancel}>
                                {cancelText}
                            </Button>
                            <Button variant="danger" onClick={onConfirm}>
                                {confirmText}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
