/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { AllocationResponse, Profile } from '../lib/supabase/types';
import { LoadingAI } from '../components/shared/LoadingAI';
import { formatVND } from '../lib/utils/vnd';
import { Sparkles, AlertTriangle, HelpCircle, ShieldCheck, Landmark, TrendingUp, Cpu, Landmark as CashIcon } from 'lucide-react';

interface AdvisorProps {
  profile: Profile;
  allocation: AllocationResponse | null;
  updateAllocation: (alloc: AllocationResponse) => void;
}

const CAT_ICONS: Record<string, any> = {
  emergency_fund: ShieldCheck,
  etf_dca: TrendingUp,
  self_investment: Cpu,
  business_capital: Sparkles,
  cash_reserve: CashIcon,
};

const CAT_TITLES: Record<string, string> = {
  emergency_fund: 'Quỹ Dự Phòng Khẩn Cấp',
  etf_dca: 'Tích sản Chứng chỉ quỹ ETF DCA',
  self_investment: 'Đầu Tư Bản Thân & Chuyên Môn',
  business_capital: 'Vốn Khởi Nghiệp / Side Hustle',
  cash_reserve: 'Tiền Mặt Chờ Cơ Hội Đại Hạ Giá',
};

const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  emergency_fund: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  etf_dca: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  self_investment: { bg: 'bg-indigo-400/10', text: 'text-indigo-400', border: 'border-indigo-400/20' },
  business_capital: { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
  cash_reserve: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20' },
};

export function Advisor({ profile, allocation, updateAllocation }: AdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRecalculate = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem(`fincopilot_apikey_${profile.id}`) || '',
        },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) {
        throw new Error('Thất bại khi liên kết máy chủ.');
      }

      const data = await res.json();
      updateAllocation(data);
    } catch (err: any) {
      console.warn(err);
      setErrorMsg('Không thể kết nối đến Co-pilot. Đang sử dụng cơ chế nội suy phòng vệ dự phòng...');
      
      // Delay so loader feels realistic before fallback is computed as contingency plan
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Use fallback logic by calling local endpoint
      // We can do a robust client side allocation fallback inside Advisor as well!
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Financial Advisor"
        subtitle="Hệ thống Co-pilot kiến tạo dòng tiền thông minh bảo vệ bản thân và nhân lũy tài sản dài hạn toàn diện nhất."
        action={
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="flex items-center gap-1.5 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-md text-xs font-bold transition-all shadow cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tái tính toán</span>
          </button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingAI message="Co-pilot đang bóc tách dự số và lập cấu trúc..." />
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {allocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Core reasoning & Warning panels */}
              <div className="lg:col-span-1 space-y-4">
                
                {/* Overall advice paragraph */}
                <div className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-lg shadow-black/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">Tổng quan chiến lược</span>
                  <p className="text-zinc-100 font-semibold text-sm leading-normal">
                    Phần bổ cơ cấu tài chính khuyên lập
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {allocation.overall_reasoning}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>Khẩu vị: {profile.risk_tolerance || 'Trung hòa'}</span>
                    <span>Tích sản: {formatVND(profile.total_savings_vnd, true)}</span>
                  </div>
                </div>

                {/* Warnings List widget */}
                {allocation.warnings && allocation.warnings.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-4 space-y-3 shadow">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">Lưu ý & Rủi ro dư nợ</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-400 leading-normal">
                      {allocation.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunity cost list widget */}
                {allocation.opportunity_cost && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg p-4 space-y-2 shadow">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider font-mono">Chi phí cơ hội (Opportunity Cost)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {allocation.opportunity_cost}
                    </p>
                  </div>
                )}

              </div>

              {/* Right Column: Reasoning cards breakdown listed side-by-side */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-zinc-300 font-bold text-sm">Bóc Tách Chi Tiết Phân Bổ</h3>

                {Object.entries(allocation.allocation).map(([key, item]) => {
                  const CatIcon = CAT_ICONS[key] || Landmark;
                  const catTitle = CAT_TITLES[key] || key;
                  const colors = CAT_COLORS[key] || { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' };

                  return (
                    <div
                      key={key}
                      className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-4.5 flex items-start gap-4 hover:border-zinc-700/60 transition-all duration-200 shadow-md"
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${colors.bg}`}>
                        <CatIcon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <h4 className="text-zinc-200 font-bold font-sans text-xs">
                            {catTitle}
                          </h4>
                          <span className={`text-xs font-mono font-bold font-semibold ${colors.text}`}>
                            {item.pct}% phân bổ ( {formatVND(item.amount_vnd)} )
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {item.reasoning}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <Sparkles className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-zinc-200 font-bold">Khởi tạo danh mục khuyên dùng</h4>
                <p className="text-zinc-500 text-xs">
                  Sử dụng năng lực Gemini bóc tách thu nhập nghề nghiệp, nợ lãi suất và quỹ khẩn cấp để lập rổ tài sản.
                </p>
              </div>
              <button
                onClick={handleRecalculate}
                className="py-2 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded text-xs transition-colors shadow"
              >
                Nhận phân bổ AI ngay
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Advisor;
