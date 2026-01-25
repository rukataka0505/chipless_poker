import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pot } from '@/lib/poker/types';

interface PotDisplayProps {
    pots: Pot[];
    totalPot: number;
}

export function PotDisplay({ pots, totalPot }: PotDisplayProps) {
    // 金額が0より大きいポットのみフィルタリング（最大6個まで）
    const activePots = pots.filter(pot => pot.amount > 0).slice(0, 6);
    const hasSidePots = activePots.length > 1;

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <AnimatePresence mode="sync">
                {totalPot > 0 && (
                    <>
                        {hasSidePots ? (
                            // サイドポットがある場合: 個別に表示
                            <motion.div
                                key="multi-pots"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-wrap justify-center gap-1.5"
                            >
                                {activePots.map((pot, index) => {
                                    const isMain = index === 0;
                                    const label = isMain ? 'MAIN' : `SIDE ${index}`;
                                    const borderColor = isMain
                                        ? 'border-yellow-500/40'
                                        : 'border-orange-500/40';
                                    const textColor = isMain
                                        ? 'text-yellow-400'
                                        : 'text-orange-400';

                                    return (
                                        <motion.div
                                            key={`pot-${index}`}
                                            initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full border ${borderColor} shadow-lg`}
                                        >
                                            <span className={`${textColor} font-bold text-xs tracking-wide`}>
                                                {label}: <span className="font-mono">{pot.amount.toLocaleString()}</span>
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            // メインポットのみの場合: 従来通りの表示
                            <motion.div
                                key="single-pot"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/40 shadow-lg"
                            >
                                <span className="text-yellow-400 font-bold text-sm tracking-wide">
                                    POT: <span className="font-mono">{totalPot.toLocaleString()}</span>
                                </span>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
