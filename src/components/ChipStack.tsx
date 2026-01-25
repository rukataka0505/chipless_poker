import React from 'react';
import { motion } from 'framer-motion';

interface ChipStackProps {
    amount: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ChipStack({ amount, size = 'md', className = '' }: ChipStackProps) {
    if (amount <= 0) return null;

    // サイズ設定 (Smaller and cleaner)
    const sizeConfig = {
        sm: { w: 12, h: 12, border: 1, offset: 2 },
        md: { w: 16, h: 16, border: 2, offset: 2 },
        lg: { w: 20, h: 20, border: 2, offset: 3 },
    };
    const { w, h, border, offset } = sizeConfig[size];

    // 金額に応じたチップの枚数計算
    const chipCount = Math.min(Math.ceil(Math.log10(amount) * 2), 8);

    return (
        <div className={`relative flex flex-col-reverse items-center ${className}`}>
            {/* Amount text removed for cleaner look, or maybe optional? 
                User said "Total Pot: ... is not needed", let's remove the amount text from the chip stack itself 
                to be purely visual as requested for the pot. 
                For player bets, it might be useful, but let's follow the "visually clear" instruction.
                If the user wants specific amounts, they can likely see it elsewhere or I can add a small tooltip.
                For now, I'll remove the text to maximize "simple and refined".
            */}
            <div className={`relative`} style={{ height: chipCount * offset + h }}>
                {Array.from({ length: chipCount }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: i * -offset, opacity: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={`
                            absolute bottom-0 left-1/2 -translate-x-1/2
                            rounded-full border border-black/10
                            shadow-sm
                            flex items-center justify-center
                        `}
                        style={{
                            width: w,
                            height: h,
                            backgroundColor: getChipColor(amount),
                            // Create a 3D-ish stack effect with border/shadow
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
                            zIndex: i,
                        }}
                    >
                        {/* Inner detail for "premium" look but simple */}
                        <div className="w-[60%] h-[60%] rounded-full border border-dashed border-white/40" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// 金額に応じた色を返す (More nuanced palette)
function getChipColor(amount: number): string {
    if (amount >= 500) return '#7c3aed'; // Violet-600
    if (amount >= 100) return '#059669'; // Emerald-600
    if (amount >= 25) return '#2563eb';  // Blue-600
    if (amount >= 5) return '#dc2626';   // Red-600
    return '#f3f4f6';                    // Gray-100 (White)
}
