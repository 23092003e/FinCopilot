/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ScenarioCompareChart } from '../components/charts/ScenarioCompareChart';
import { formatVND } from '../lib/utils/vnd';
import { Profile } from '../types';
import { TrendingUp, AlertTriangle, Coins, BarChart3 } from 'lucide-react';

interface ScenariosProps {
  profile: Profile;
}

export function Scenarios({ profile }: ScenariosProps) {
  const [sideBusinessRate, setSideBusinessRate] = useState<number>(20); // 20% p.a default side business success
  const [etfRate, setEtfRate] = useState<number>(11); // 11% p.a standard VN30 average
  const [bankRate, setBankRate] = useState<number>(4); // 4% p.a bank savings return index
  
  // Calculate weighted average return based on user profile risk setting
  let mixedRate = 9;
  if (profile.risk_tolerance === 'aggressive') {
    mixedRate = 12.5;
  } else if (profile.risk_tolerance === 'conservative') {
    mixedRate = 6.0;
  }

  const monthlySaving = profile.monthly_income_vnd - profile.monthly_expenses_vnd;
  const savingToUse = monthlySaving > 0 ? monthlySaving : 10000000; // minimum fallback 10M

  const compoundVal = (monthly: number, annualRate: number, years: number) => {
    let balance = 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = years * 12;
    for (let m = 0; m < totalMonths; m++) {
      balance = (balance + monthly) * (1 + monthlyRate);
    }
    return Math.round(balance);
  };

  const tableMilestones = [1, 3, 5, 10];

  return (
    <div className="space-y-6">
      <PageHeader
        title="So Sánh Tài Sản Hành Trình"
        subtitle="Đặt bàn cân so sánh hiệu quả tích lũy giữa 4 rổ tài sản tiêu biểu giúp bạn định vị sự đánh đổi lợi nhuận và biến động rủi ro."
      />

      {/* Main interactive weights slider */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-md">
        <div className="space-y-1">
          <h4 className="text-zinc-200 text-sm font-semibold flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            Tài khoản Đích / Vốn Góp Độc lập
          </h4>
          <p className="text-xs text-zinc-400 font-medium">
            Số tài phiệt tích lũy hàng tháng phục vụ đầu tư: <strong className="text-emerald-400">{formatVND(savingToUse, true)}</strong>
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400 font-semibold font-sans">Kỳ vọng Tự doanh phụ (Side Hustle)</span>
            <span className="text-emerald-400 font-mono font-bold">{sideBusinessRate}% p.a</span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={sideBusinessRate}
            onChange={(e) => setSideBusinessRate(parseFloat(e.target.value))}
            className="w-full accent-purple-500 bg-zinc-950 rounded h-1 cursor-pointer"
          />
        </div>

        <div className="bg-zinc-950 p-3.5 border border-zinc-900 rounded-lg flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-405 text-amber-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Ý kiến phòng vệ</span>
            <span className="text-[11px] text-zinc-400 leading-normal block">Hiệu suất tự doanh cao đi kèm rủi ro sập tiệm hoặc cháy dòng vốn.</span>
          </div>
        </div>
      </div>

      {/* Split layout: Chart vs Table comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario compare chart component */}
        <div className="lg:col-span-2">
          <ScenarioCompareChart
            monthlyContribution={savingToUse}
            sideBusinessReturn={sideBusinessRate}
            etfReturn={etfRate}
            bankReturn={bankRate}
            mixedReturn={mixedRate}
          />
        </div>

        {/* Milestone side table representation */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 shadow flex flex-col justify-between">
          <div>
            <h3 className="text-zinc-200 text-sm font-bold flex items-center gap-1.5 mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Chi Tiết Kết Quả Kỳ Vọng
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
              Theo mức dòng vốn gốc hàng tháng là {formatVND(savingToUse, true)}. Phản ánh dồn nạp qua mốc thời gian.
            </p>

            <div className="space-y-3 max-h-[260px] overflow-y-auto">
              {tableMilestones.map((yr) => {
                const bankVal = compoundVal(savingToUse, bankRate, yr);
                const etfVal = compoundVal(savingToUse, etfRate, yr);
                const businessVal = compoundVal(savingToUse, sideBusinessRate, yr);
                const mixedVal = compoundVal(savingToUse, mixedRate, yr);

                return (
                  <div key={yr} className="bg-zinc-950/60 p-3 border border-zinc-850 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-1.5">
                      <span className="font-bold text-zinc-200">Mốc {yr} Năm</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Vốn gốc: {formatVND(savingToUse * 12 * yr, true)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-sans">
                      <div className="flex justify-between text-zinc-450 text-zinc-400">
                        <span>Tiết kiệm:</span> 
                        <strong className="text-zinc-350 text-zinc-300 font-mono">{formatVND(bankVal, true)}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-450 text-zinc-400">
                        <span>Tích sản ETF:</span> 
                        <strong className="text-emerald-400 font-mono">{formatVND(etfVal, true)}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-450 text-zinc-400">
                        <span>Tự doanh:</span> 
                        <strong className="text-purple-400 font-mono">{formatVND(businessVal, true)}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-450 text-zinc-400">
                        <span>Hỗn hợp:</span> 
                        <strong className="text-indigo-400 font-mono">{formatVND(mixedVal, true)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 p-3 rounded text-[11px] text-zinc-500 space-y-1 mt-4">
            <span className="text-zinc-400 font-bold block">Nguyên lý Đánh Đổi Rủi Ro:</span>
            <p className="leading-relaxed">
              Kênh **Ngân hàng** bảo mật cao nhất nhưng tăng trưởng kém nhất. Kênh **DCA ETF** biến động vừa phải dài hạn ổn định vượt trội. Kênh **Tự doanh phụ** ROI cực cao nhưng biến động cực đại.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Scenarios;
