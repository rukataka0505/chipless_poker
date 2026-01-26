import React from 'react';
import { Smartphone } from 'lucide-react';

export const OrientationGuard: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 text-white flex flex-col items-center justify-center hidden portrait:flex md:hidden">
            <div className="animate-pulse">
                <Smartphone className="w-16 h-16 mb-4 rotate-90" />
            </div>
            <p className="text-xl font-bold">画面を横にしてください</p>
            <p className="text-sm text-gray-400 mt-2">このアプリは横画面専用です</p>
        </div>
    );
};
