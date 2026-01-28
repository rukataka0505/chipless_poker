import React from 'react';
import { Plus } from 'lucide-react';

interface AddPlayerCardProps {
    onClick: () => void;
}

export function AddPlayerCard({ onClick }: AddPlayerCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-16 h-16 rounded-full bg-white/10 border border-white/20 hover:border-electric/50 hover:bg-white/15 flex items-center justify-center transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] relative z-20"
        >
            <Plus className="text-gray-400 group-hover:text-electric transition-colors" size={24} />
            <span className="sr-only">プレイヤー追加</span>
        </button>
    );
}
