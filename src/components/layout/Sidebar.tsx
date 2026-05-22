/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  Compass,
  LineChart,
  Lightbulb,
  Settings,
  Flame,
  LogOut,
  Download,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onboardingCompleted?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, onboardingCompleted = true }: SidebarProps) {
  const { logout } = useAuth();
  const { t, isInstallable, installPWA } = useUI();
  
  const menuItems = [
    { id: 'dashboard', langKey: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'advisor', langKey: 'nav.advisor', icon: Compass },
    { id: 'onboarding', langKey: 'nav.onboarding', icon: UserCheck },
    { id: 'simulator', langKey: 'nav.simulator', icon: TrendingUp },
    { id: 'scenarios', langKey: 'nav.scenarios', icon: LineChart },
    { id: 'side-hustle', langKey: 'nav.sidehustle', icon: Lightbulb },
    { id: 'settings', langKey: 'nav.settings', icon: Settings },
  ];

  return (
    <aside className="w-68 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex transition-colors duration-200">
      {/* Brand Label */}
      <div className="p-6 border-b border-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-zinc-100 font-extrabold text-base tracking-tight font-sans">
              FinCopilot
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold font-mono">
              AI VN Advisor
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>{t(item.langKey)}</span>
              {item.id === 'onboarding' && !onboardingCompleted && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button and Foot Credits */}
      <div className="p-4 border-t border-zinc-900/60 space-y-3">
        {isInstallable && (
          <button
            onClick={installPWA}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 hover:border-emerald-400/50 rounded-lg text-xs font-bold text-emerald-400 cursor-pointer shadow-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all animate-pulse"
          >
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span>{t('pwa.install')}</span>
          </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-zinc-900 hover:bg-zinc-900 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('nav.logout')}</span>
        </button>

        <div className="text-center">
          <p className="text-[10px] text-zinc-650 text-zinc-650 font-mono">
            {t('nav.developed_by')}
          </p>
          <span className="text-[9px] text-zinc-500">
            {t('nav.vnyouth')}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
