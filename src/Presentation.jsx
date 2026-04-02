import React, { useState } from 'react';
import { TenantDashboard } from './App';
import App from './App';

export default function PresentationDemo() {
    const [demoMode, setDemoMode] = useState('manager'); // 'manager' | 'tenant'

    const MOCK_TENANT = {
        id: 'T-DEMO',
        name: 'Alex Sterling',
        email: 'alex@sterling.com',
        unit: 'Penthouse 504',
        baseRent: 3500,
        outstandingBalance: 1750,
        deposit: 4000,
        dueDate: '2026-04-01',
        leaseDocument: 'https://example.com/demo-lease.pdf',
        utilityShare: 0.22,
        mobile: '+123456789'
    };

    const MOCK_UNIT = {
        unitNumber: 'Penthouse 504',
        status: 'Occupied',
        totalArrears: 1750
    };

    const MOCK_MESSAGES = [
        {
            id: 'M-1',
            timestamp: '2026-03-30T10:00:00Z',
            content: "The balcony door sensor is acting up.",
            status: 'RESOLVED',
            handledBy: 'Tech Support',
            photoUrl: 'https://placehold.co/400x300?text=Sensor+Issue'
        },
        {
            id: 'M-2',
            timestamp: '2026-04-02T15:00:00Z',
            content: "Requesting a parking pass for my guest next week.",
            status: 'IN PROGRESS',
            handledBy: 'Concierge'
        }
    ];

    if (demoMode === 'manager') {
        return (
            <div className="relative">
                <div className="fixed bottom-8 right-8 z-[9999]">
                    <button 
                        onClick={() => setDemoMode('tenant')}
                        className="bg-white text-black font-black px-6 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <span>🚀 SWITCH TO TENANT VIEW</span>
                    </button>
                </div>
                {/* We render the full App in manager mode */}
                <App />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-12 relative">
             <div className="fixed bottom-8 right-8 z-[9999]">
                <button 
                    onClick={() => setDemoMode('manager')}
                    className="bg-indigo-600 text-white font-black px-6 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center gap-2 border border-white/20"
                >
                    <span>🛠 BACK TO MANAGER VIEW</span>
                </button>
            </div>
            <div className="max-w-6xl mx-auto mt-10">
                <div className="mb-12 flex flex-col items-center">
                    <div className="px-4 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 mb-4 animate-pulse">
                        <span className="text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase">Simulated Production Environment</span>
                    </div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4 text-center">TENANT PORTAL PREVIEW</h1>
                    <p className="text-slate-500 text-sm font-bold max-w-lg text-center leading-relaxed">
                        A centralized hub for tenants to manage payments, track maintenance tickets, and access verified legal documents.
                    </p>
                    <div className="h-1 w-32 bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 rounded-full mt-8"></div>
                </div>
                
                <TenantDashboard 
                    tenant={MOCK_TENANT}
                    unit={MOCK_UNIT}
                    tenantMessages={MOCK_MESSAGES}
                    currency="$"
                    onSendMessage={() => alert('Demo: Support Request Sent!')}
                />
            </div>
        </div>
    );
}
