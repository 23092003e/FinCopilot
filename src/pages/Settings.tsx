/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Profile } from '../lib/supabase/types';
import { VNDInput } from '../components/shared/VNDInput';
import { User, Eye, EyeOff, RotateCcw, ShieldCheck, Check, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

interface SettingsProps {
  profile: Profile;
  updateProfile: (profile: Partial<Profile>) => void;
  resetAllData: (wipeBlank?: boolean) => void;
}

export function Settings({ profile, updateProfile, resetAllData }: SettingsProps) {
  const { customApiKey, saveCustomApiKey } = useAuth();
  const { language, t } = useUI();
  
  const [name, setName] = useState(profile.full_name || '');
  const [career, setCareer] = useState(profile.career_field || 'software');
  const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive'>(profile.risk_tolerance || 'moderate');
  const [knowledge, setKnowledge] = useState<'beginner' | 'intermediate' | 'advanced'>(profile.investment_knowledge || 'intermediate');
  const [savings, setSavings] = useState(profile.total_savings_vnd || 50000000);
  const [income, setIncome] = useState(profile.monthly_income_vnd || 25000000);
  const [expenses, setExpenses] = useState(profile.monthly_expenses_vnd || 12000000);

  const [savingStatus, setSavingStatus] = useState(false);
  const [resettingStatus, setResettingStatus] = useState(false);
  
  // Custom API key states
  const [apiKey, setApiKey] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);

  const CAREERS = [
    { value: 'software', label_vi: 'Phát triển Phần mềm (Software)', label_en: 'Software Development' },
    { value: 'ai_ml', label_vi: 'Trí tuệ nhân tạo (AI / ML)', label_en: 'AI / Machine Learning' },
    { value: 'design', label_vi: 'Thiết kế (UI/UX, Graphic Design)', label_en: 'UI/UX & Graphic Design' },
    { value: 'marketing', label_vi: 'Nhà tăng trưởng (Marketing / Growth)', label_en: 'Marketing & Audience Growth' },
    { value: 'finance', label_vi: 'Tài chính thương mại (Finance)', label_en: 'Finance & Banking' },
    { value: 'freelance', label_vi: 'Làm việc tự do (Freelancer)', label_en: 'Independent Freelancer' },
    { value: 'other', label_vi: 'Ngoại ngành / Lĩnh vực khác', label_en: 'Other Fields / Specializations' },
  ];

  useEffect(() => {
    setApiKey(customApiKey);
  }, [customApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus(true);
    
    updateProfile({
      full_name: name,
      career_field: career as any,
      risk_tolerance: risk,
      investment_knowledge: knowledge,
      total_savings_vnd: savings,
      monthly_income_vnd: income,
      monthly_expenses_vnd: expenses,
    });

    setTimeout(() => {
      setSavingStatus(false);
    }, 1500);
  };

  const handleReset = (wipeBlank: boolean) => {
    const confirmMsg = wipeBlank
      ? (language === 'vi' 
          ? 'XÁC NHẬN: Bạn muốn XÓA SẠCH HOÀN TOÀN toàn bộ lịch sử giao dịch trong Sổ, nội dung check-in tự động, cấu trúc tài sản và thông tin thiết lập để tạo một tài khoản TRẮNG BẮT ĐẦU MỚI hoàn toàn?\n\n(Hành động này sẽ giải phóng 100% tài khoản của bạn để nhập dữ liệu thực tế)' 
          : 'CONFIRM: Do you want to WIPE EVERYTHING completely? This will clear all transactions, check-ins, allocations, and user settings to start with an ABSOLUTE BLANK Slate.\n\n(Ideal for setting up your actual personal workspace)')
      : (language === 'vi'
          ? 'XÁC NHẬN: Bạn muốn đặt cấu trúc dữ liệu về trạng thái Mẫu Demo Nguyễn Minh Anh (đầy đủ lịch sử giao dịch, checkkin mẫu, biểu đồ đầy đủ)?'
          : 'CONFIRM: Do you want to restore the comprehensive Demo template data (Nguyễn Minh Anh profile, sample ledger list, and full charts setup) for quick exploration?');

    if (window.confirm(confirmMsg)) {
      setResettingStatus(true);
      resetAllData(wipeBlank);
      setTimeout(() => {
        setResettingStatus(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title={t('setting.title')}
        subtitle={t('setting.subtitle')}
      />

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5 shadow-xl text-xs transition-colors duration-200">
        <h3 className="text-zinc-200 text-sm font-bold border-b border-zinc-850 pb-2 flex items-center gap-1.5">
          <User className="w-4 h-4 text-emerald-400" />
          {language === 'vi' ? 'Thông tin cá nhân & Thiết lập dòng tiền' : 'Demographics & Stream Configuration'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* USER FULL NAME */}
          <div className="space-y-1.5">
            <label htmlFor="set_name" className="block text-zinc-400 font-bold uppercase tracking-wider">{t('setting.fullname')}</label>
            <input
              id="set_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded p-2 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              required
            />
          </div>

          {/* CAREER FIELD OPTIONS */}
          <div className="space-y-1.5">
            <label htmlFor="set_career" className="block text-zinc-400 font-bold uppercase tracking-wider">{t('setting.career')}</label>
            <select
              id="set_career"
              value={career}
              onChange={(e) => setCareer(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded p-2 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
            >
              {CAREERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {language === 'vi' ? c.label_vi : c.label_en}
                </option>
              ))}
            </select>
          </div>

          {/* RISK TOLERANCE */}
          <div className="space-y-1.5">
            <label htmlFor="set_risk" className="block text-zinc-400 font-bold uppercase tracking-wider">{t('setting.risk')}</label>
            <select
              id="set_risk"
              value={risk}
              onChange={(e) => setRisk(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded p-2 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="conservative">{t('setting.risk.conservative')}</option>
              <option value="moderate">{t('setting.risk.moderate')}</option>
              <option value="aggressive">{t('setting.risk.aggressive')}</option>
            </select>
          </div>

          {/* INVESTMENT KNOWLEDGE */}
          <div className="space-y-1.5">
            <label htmlFor="set_knowledge" className="block text-zinc-400 font-bold uppercase tracking-wider">{t('setting.knowledge')}</label>
            <select
              id="set_knowledge"
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded p-2 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="beginner">{t('setting.knowledge.low')}</option>
              <option value="intermediate">{t('setting.knowledge.medium')}</option>
              <option value="advanced">{t('setting.knowledge.high')}</option>
            </select>
          </div>

          {/* TOTAL SAVINGS */}
          <div className="space-y-1.5">
            <label htmlFor="set_savings" className="block text-zinc-400 font-bold uppercase tracking-wider">
              {language === 'vi' ? 'Tổng vốn tiết kiệm nhàn rỗi (VND)' : 'Total Idle Savings capital (VND)'}
            </label>
            <VNDInput
              id="set_savings"
              value={savings}
              onChange={(val) => setSavings(val)}
            />
          </div>

          {/* MONTHLY INCOME */}
          <div className="space-y-1.5">
            <label htmlFor="set_income" className="block text-zinc-400 font-bold uppercase tracking-wider">
              {language === 'vi' ? 'Thu nhập chủ động hàng tháng (VND)' : 'Monthly Active Income (VND)'}
            </label>
            <VNDInput
              id="set_income"
              value={income}
              onChange={(val) => setIncome(val)}
            />
          </div>

          {/* MONTHLY EXPENSES */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="set_expenses" className="block text-zinc-400 font-bold uppercase tracking-wider">
              {language === 'vi' ? 'Chi tiêu cố định hàng tháng (VND)' : 'Fixed Monthly Expenses (VND)'}
            </label>
            <VNDInput
              id="set_expenses"
              value={expenses}
              onChange={(val) => setExpenses(val)}
            />
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingStatus}
            className="py-2.5 px-6 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {savingStatus ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('setting.saved')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('setting.save')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Gemini API Key Configuration Section Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4 shadow-xl text-xs transition-colors duration-200">
        <h3 className="text-zinc-200 text-sm font-bold border-b border-zinc-850 pb-2.5 flex items-center gap-1.5">
          <Key className="w-4 h-4 text-emerald-400" />
          {t('api.title')}
        </h3>
        
        <p className="text-zinc-400 leading-relaxed font-sans font-medium">
          {t('api.description')}
        </p>

        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label htmlFor="set_api_key" className="block text-zinc-400 font-bold uppercase tracking-wider">{t('api.key_label')}</label>
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 max-w-max bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {customApiKey ? t('api.private_key') : t('api.shared_key')}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="set_api_key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('api.placeholder')}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded p-2.5 focus:outline-none focus:border-emerald-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                saveCustomApiKey(apiKey);
                setIsApiKeySaved(true);
                setTimeout(() => setIsApiKeySaved(false), 2000);
              }}
              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isApiKeySaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('api.saved_status')}</span>
                </>
              ) : (
                <span>{t('api.save')}</span>
              )}
            </button>
          </div>
          
          <p className="text-[10px] text-zinc-500 leading-normal italic font-sans pl-1">
            {t('api.disclaimer')}
          </p>
        </div>
      </div>

      {/* Extreme Reset Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-5 space-y-4 transition-colors duration-200">
        <div>
          <h4 className="text-red-400 font-bold text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            {language === 'vi' ? 'Vùng nguy hiểm (Danger Zone)' : 'Danger Zone'}
          </h4>
          <p className="text-zinc-500 text-xs mt-1">
            {language === 'vi'
              ? 'Thực hiện thao tác dọn dẹp cơ sở dữ liệu. Nhấp vào tùy chọn phù hợp để xóa sổ giao dịch hoặc nạp lại cấu trúc mẫu thử nghiệm.'
              : 'Perform database cleanup operations. Choose the appropriate action below to either purge all records or reload demo mock data.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleReset(true)}
            disabled={resettingStatus}
            className="flex-1 py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white font-black rounded text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-red-500/25 active:scale-95"
          >
            {resettingStatus ? (
              <span>{language === 'vi' ? 'Đang giải phóng bộ nhớ...' : 'Purging database...'}</span>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'XÓA SẠCH TOÀN BỘ (Tài khoản TRẮNG)' : 'WIPE ABSOLUTELY CLEAN (Blank slate)'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleReset(false)}
            disabled={resettingStatus}
            className="flex-1 py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-bold rounded text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-zinc-800 active:scale-95"
          >
            {resettingStatus ? (
              <span>{language === 'vi' ? 'Khôi phục...' : 'Restoring...'}</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'vi' ? 'Khôi phục tài khoản DEMO' : 'Restore MOCK DEMO profile'}</span>
              </>
            )}
          </button>
        </div>
        
        <div className="bg-zinc-950/40 p-3 rounded border border-zinc-900 text-[10px] text-zinc-500 leading-normal font-medium">
          {language === 'vi' ? (
            <p>
              💡 <strong className="text-zinc-400">Gợi ý phân biệt:</strong> Hãy chọn <span className="text-red-400">Xóa Sạch Toàn Bộ</span> nếu bạn muốn bắt đầu lưu dòng tiền thực tế của cá nhân bạn (Onboarding mới, 0 giao dịch). Chọn <span className="text-zinc-300">Khôi phục tài khoản DEMO</span> nếu bạn muốn lấy lại số liệu có sẵn của Nguyễn Minh Anh để vọc thử các tính năng biểu đồ, chatbot Telegram, cố vấn AI...
            </p>
          ) : (
            <p>
              💡 <strong className="text-zinc-400">Quick Guide:</strong> Select <span className="text-red-400">WIPE ABSOLUTELY CLEAN</span> to log your active personal finances (re-runs onboarding, 0 entries in ledger). Select <span className="text-zinc-300">Restore MOCK DEMO</span> if you just want to play around with ready-to-test charts, automated advisory, and Telegram webhooks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
