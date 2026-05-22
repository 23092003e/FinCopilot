/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Flame, ShieldAlert, CheckCircle, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { Profile } from '../../lib/supabase/types';
import { formatVND } from '../../lib/utils/vnd';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

interface TopNavProps {
  profile: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopNav({ profile, activeTab, setActiveTab }: TopNavProps) {
  const { logout } = useAuth();
  const { theme, language, toggleTheme, setLanguage, t } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', langKey: 'nav.dashboard' },
    { id: 'advisor', langKey: 'nav.advisor' },
    { id: 'onboarding', langKey: 'nav.onboarding' },
    { id: 'simulator', langKey: 'nav.simulator' },
    { id: 'scenarios', langKey: 'nav.scenarios' },
    { id: 'side-hustle', langKey: 'nav.sidehustle' },
    { id: 'settings', langKey: 'nav.settings' },
  ];

  const handleMobileNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const isFundStandard = profile.emergency_fund_months >= 3;

  const getTranslatedCareer = (field: string | null) => {
    if (!field) return t('stat.new_member');
    if (field === 'software') return t('stat.software_engineer');
    if (field === 'ai_ml') return t('stat.aiml_engineer');
    return t('stat.professional');
  };

  return (
    <header className="bg-zinc-950/80 backdrop-blur border-b border-zinc-900 sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between transition-colors duration-200">
      {/* Mobile Branding */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
          <Flame className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-zinc-150 font-extrabold text-sm font-sans">
          FinCopilot
        </span>
      </div>

      {/* Profile quick stats on Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 py-1.5 px-3 rounded-full text-xs transition-colors duration-200">
          <span className="text-zinc-400 font-medium">{t('stat.actual_savings')}</span>
          <span className="text-emerald-400 font-extrabold">
            {formatVND(profile.total_savings_vnd, true)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 py-1.5 px-3 rounded-full text-xs transition-colors duration-200">
          <span className="text-zinc-400 font-medium font-sans">{t('stat.fund_status')}</span>
          {isFundStandard ? (
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-semibold text-[11px]">{t('stat.stable')} ({profile.emergency_fund_months}T)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
              <span className="font-semibold text-[11px]">{t('stat.low_risk')} ({profile.emergency_fund_months}T)</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Tools, Theme, Language & User Badge */}
      <div className="flex items-center gap-3">
        {/* Toggle bars inside controls */}
        <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3.5">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            type="button"
            className="p-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-all flex items-center gap-1 cursor-pointer font-bold font-mono text-[10px] shadow-sm select-none"
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe className="w-3 h-3 text-zinc-500" />
            <span className="uppercase">{language}</span>
          </button>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-zinc-100">{profile.full_name || t('stat.new_member')}</p>
          <span className="text-[10px] text-zinc-400 capitalize">{getTranslatedCareer(profile.career_field)}</span>
        </div>
        
        <div className="w-8.5 h-8.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-xs text-indigo-400 font-bold select-none cursor-pointer hover:bg-indigo-500/20 transition-all shadow-sm">
          {(profile.full_name || 'FC')[0].toUpperCase()}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-150 md:hidden focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-zinc-900 shadow-2xl p-4 space-y-2 md:hidden flex flex-col z-50">
          <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-900 pb-3 mb-2 flex items-center">
            <div>
              <span className="text-[10px] text-zinc-400">{t('stat.actual_savings')}</span>
              <p className="text-emerald-400 font-bold">{formatVND(profile.total_savings_vnd, true)}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">User</span>
              <p className="text-zinc-250 font-bold">{profile.full_name || 'FC'}</p>
            </div>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNavClick(item.id)}
              className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-zinc-900 text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-150 hover:bg-zinc-900/40'
              }`}
            >
              {t(item.langKey)}
            </button>
          ))}
          <div className="border-t border-zinc-900/80 my-1 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left py-2 px-3 rounded-md text-xs font-bold text-red-400 hover:bg-red-500/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopNav;
