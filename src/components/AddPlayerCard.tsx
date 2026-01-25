import React from 'react';
import { Plus } from 'lucide-react';

interface AddPlayerCardProps {
    onClick: () => void;
}

export function AddPlayerCard({ onClick }: AddPlayerCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 hover:border-yellow-500/50 hover:bg-white/10 flex items-center justify-center transition-all duration-300 group cursor-pointer"
        >
            <Plus className="text-white/30 group-hover:text-yellow-500/80 transition-colors" size={24} />
            <span className="sr-only">Add Player</span>
        </button>
    );
}
