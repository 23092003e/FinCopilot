/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Menu, X, Flame, ShieldAlert, CheckCircle, LogOut, Sun, Moon, Globe, Download } from 'lucide-react';
import { Profile } from '../../types';
import { formatVND } from '../../lib/utils/vnd';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

interface TopNavProps {
  profile: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  assetHoldings?: any[];
}

export function TopNav({ profile, activeTab, setActiveTab, assetHoldings = [] }: TopNavProps) {
  const { logout } = useAuth();
  const { theme, language, toggleTheme, setLanguage, t, isInstallable, installPWA } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketPrices, setMarketPrices] = useState<any>(null);

  // Poll for latest market rates in TopNav to align savings valuation
  useEffect(() => {
    let active = true;
    const fetchPrices = async () => {
      try {
        const apiKey = localStorage.getItem(`fincopilot_apikey_${profile?.id}`) || '';
        const faToken = localStorage.getItem(`fincopilot_fireant_token_${profile?.id}`) || '';
        const res = await fetch('/api/market-prices', {
          headers: {
            'x-gemini-api-key': apiKey,
            'x-fireant-token': faToken
          }
        });
        if (res.ok && active) {
          const data = await res.json();
          setMarketPrices(data);
        }
      } catch (err) {
        console.warn('Error fetching live rates in top nav:', err);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 20000); // 20s poller for TopNav is fine
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [profile?.id]);

  // Compute portfolio's current total asset valuation in TopNav
  const portfolioValue = useMemo(() => {
    let total = 0;
    const defaultBases: Record<string, number> = {
      E1VFVN30: 23450,
      FUEVFVND: 31200,
      FUEMAV30: 15800,
      FUEKIV30: 12400,
      FUEVN100: 17100,
      FUESSV30: 16200,
      FUESSVFL: 22900,
      FUESSV50: 18700,
      FUETFID: 14500,
      FUETCMID: 13650,
      GOLD_TA_9999: 8200000,
      GOLD_24K: 8150000,
      GOLD_WHITE_10K: 3450000,
      GOLD_WHITE_14K: 4850000,
      GOLD_WHITE_18K: 6250000,
      GOLD_ROSE_10K: 3400000,
      GOLD_ROSE_14K: 4800000,
      GOLD_ROSE_18K: 6200000,
      GOLD_WEST_8K: 2700000,
      GOLD_WEST_9K: 3050000,
      GOLD_WEST_10K: 3350000,
      GOLD_WEST_14K: 4750000,
      GOLD_WEST_18K: 6150000,
      GOLD_ITALY_750: 5550000,
      GOLD_ITALY_925: 180000,
      GOLD_NON: 2500000,
      GOLD_MY_KY: 50000,
      GOLD_SJC: 90500000,
      GOLD_RING: 7850000
    };

    assetHoldings.forEach((h: any) => {
      const livePrice = (marketPrices && marketPrices[h.symbol])
        ? marketPrices[h.symbol].price_vnd
        : (defaultBases[h.symbol] || h.price_vnd || 0);
      total += h.quantity * livePrice;
    });
    return total;
  }, [assetHoldings, marketPrices]);

  const menuItems = [
    { id: 'dashboard', langKey: 'nav.dashboard' },
    { id: 'advisor', langKey: 'nav.advisor' },
    { id: 'onboarding', langKey: 'nav.onboarding' },
    { id: 'ledger', langKey: 'nav.ledger' },
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
        <span className="text-zinc-100 font-extrabold text-sm font-sans">
          FinCopilot
        </span>
      </div>

      {/* Profile quick stats on Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 py-1.5 px-3 rounded-full text-xs transition-colors duration-200">
          <span className="text-zinc-400 font-medium">{t('stat.actual_savings')}</span>
          <span className="text-emerald-400 font-extrabold">
            {formatVND(profile.total_savings_vnd + portfolioValue, true)}
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
          {isInstallable && (
            <button
              onClick={installPWA}
              className="mr-1.5 hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/50 rounded-lg text-[11px] font-bold tracking-tight shadow-sm cursor-pointer transition-all animate-pulse"
              title={t('pwa.install')}
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>Install</span>
            </button>
          )}

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
          className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-100 md:hidden focus:outline-none cursor-pointer"
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
              <p className="text-emerald-400 font-bold">{formatVND(profile.total_savings_vnd + portfolioValue, true)}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">User</span>
              <p className="text-zinc-250 font-bold">{profile.full_name || 'FC'}</p>
            </div>
          </div>

          {isInstallable && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                installPWA();
              }}
              className="w-full mb-3 flex items-center justify-between gap-2 px-3.5 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-lg text-xs font-bold text-emerald-400 shadow-sm cursor-pointer transition-all animate-pulse"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-zinc-100">{t('pwa.install')}</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-mono">STANDALONE</span>
            </button>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNavClick(item.id)}
              className={`w-full text-left py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-zinc-900 text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
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
