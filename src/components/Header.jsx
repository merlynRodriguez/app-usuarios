import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                    Junta Vecinal Bolívar
                </h1>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs ring-2 ring-brand-50">
                    Bol
                </div>
            </div>
        </header>
    );
}
