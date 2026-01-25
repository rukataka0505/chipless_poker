'use client';

import React, { useState } from 'react';
import { Trophy, Coins, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

// Type definition for dummy player
type DummyPlayer = {
    name: string;
    stack: number;
    bet: number;
    isActive: boolean;
};

const DUMMY_PLAYER: DummyPlayer = {
    name: "Alex",
    stack: 1500,
    bet: 250,
    isActive: true,
};

// --- Variant A: Corner Chip Badge (User Suggestion) ---
function VariantA({ player }: { player: DummyPlayer }) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-electric/20 rounded-3xl blur-xl animate-pulse-slow" />
            <Card variant="highlight" className="w-40 h-32 p-4 flex flex-col items-center justify-between bg-black/80 relative overflow-visible">
                <div className="font-bold text-white text-lg">{player.name}</div>
                <div className="font-display font-bold text-2xl text-white">{player.stack}</div>

                {/* Decoration */}
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />

                {/* Corner Chip Badge */}
                <div className="absolute -bottom-3 -left-3 bg-gradient-to-br from-gold to-yellow-600 rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.4)] border-2 border-white/20 z-10">
                    <Coins className="w-5 h-5 text-black mb-[-2px]" />
                    <span className="text-black font-bold text-xs">{player.bet}</span>
                </div>
            </Card>
            <div className="mt-4 text-center text-sm text-gray-400">Variant A<br />Corner Chip Badge</div>
        </div>
    );
}

// --- Variant B: Floating Satellite Pill ---
function VariantB({ player }: { player: DummyPlayer }) {
    return (
        <div className="relative group flex flex-col items-center gap-2">
            <div className="absolute inset-0 bg-electric/20 rounded-3xl blur-xl animate-pulse-slow" />

            {/* Floating Bet Pill - "Satellite" */}
            <div className="relative z-20 animate-float">
                <div className="bg-black/90 backdrop-blur border border-gold/50 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                    <span className="text-[10px] text-gold/70 uppercase font-bold tracking-wider">BET</span>
                    <span className="font-display font-bold text-gold text-lg">{player.bet}</span>
                </div>
                {/* Connector Line (Optional visual anchor) */}
                <div className="absolute left-1/2 top-full w-px h-3 bg-gradient-to-b from-gold/50 to-transparent -translate-x-1/2" />
            </div>

            <Card variant="highlight" className="w-40 h-28 p-4 flex flex-col items-center justify-center bg-black/80">
                <div className="font-bold text-white text-lg">{player.name}</div>
                <div className="font-display font-bold text-2xl text-white">{player.stack}</div>
            </Card>
            <div className="mt-4 text-center text-sm text-gray-400">Variant B<br />Floating Satellite</div>
        </div>
    );
}

// --- Variant C: Neon Side-Tab ---
function VariantC({ player }: { player: DummyPlayer }) {
    return (
        <div className="relative group pl-3">
            <div className="absolute inset-0 bg-electric/20 rounded-3xl blur-xl animate-pulse-slow ml-3" />

            {/* Side Tab */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-16 w-8 bg-gold rounded-l-xl z-20 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] border-y border-l border-white/20">
                <div className="-rotate-90 text-black font-bold text-xs tracking-widest whitespace-nowrap">
                    {player.bet}
                </div>
            </div>

            <Card variant="highlight" className="w-40 h-32 p-4 flex flex-col items-center justify-center bg-black/80 relative z-10 ml-2 rounded-l-sm border-l-0">
                <div className="font-bold text-white text-lg">{player.name}</div>
                <div className="font-display font-bold text-2xl text-white">{player.stack}</div>
            </Card>
            <div className="mt-4 text-center text-sm text-gray-400">Variant C<br />Neon Side-Tab</div>
        </div>
    );
}

export default function DesignPage() {
    return (
        <div className="min-h-screen p-8 bg-void flex flex-col items-center">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Design Lab</h1>
            <p className="text-gray-400 mb-12">Comparing &quot;Betting Visualization&quot; Styles</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
                <VariantA player={DUMMY_PLAYER} />
                <VariantB player={DUMMY_PLAYER} />
                <VariantC player={DUMMY_PLAYER} />
            </div>

            <div className="mt-16 p-6 bg-white/5 rounded-2xl max-w-2xl text-gray-300 text-sm leading-relaxed">
                <strong className="text-white block mb-2">Developer Notes:</strong>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Variant A</strong> follows your suggestion: A dedicated chip badge overlapping the corner. Very classic and clear interaction.</li>
                    <li><strong>Variant B</strong> treats the bet as a floating object separate from the player (&quot;chips on the table&quot;). Feels more dynamic.</li>
                    <li><strong>Variant C</strong> integrates the value into the card structure itself, modifying the silhouette. Very sleek/cyberpunk.</li>
                </ul>
            </div>
        </div>
    );
}
