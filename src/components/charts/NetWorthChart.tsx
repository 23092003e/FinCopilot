/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatVND } from '../../lib/utils/vnd';

interface NetWorthChartProps {
  savings: number;
  income: number;
  expenses: number;
  debt: number;
  emergencyFundMonths: number;
}

export function NetWorthChart({ savings, income, expenses, debt, emergencyFundMonths }: NetWorthChartProps) {
  // Financial metrics
  const monthlySavings = income - expenses;
  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
  const debtToSavings = savings > 0 ? (debt / savings) * 100 : 0;
  
  // Scoring logic out of 100
  let healthScore = 50; // base
  if (savingsRate > 20) healthScore += 15;
  if (savingsRate > 40) healthScore += 10;
  if (emergencyFundMonths >= 3) healthScore += 15;
  if (emergencyFundMonths >= 6) healthScore += 5;
  if (debt === 0) healthScore += 15;
  if (debt > 0 && debtToSavings < 20) healthScore += 5;
  healthScore = Math.min(100, Math.max(10, healthScore));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Tuyệt vời: Bạn đang đi cực kỳ đúng tiến độ tự do tài chính.';
    if (score >= 50) return 'Khá tốt: Hãy tối ưu thêm chi tiêu nhằm đẩy tốc độ tích lũy cao hơn.';
    return 'Cần lưu ý: Ưu tiên trả dứt nợ xấu và xây vững bệ đỡ quỹ dự phòng.';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Health Score */}
      <div className={`md:col-span-1 border rounded-xl p-5 flex flex-col justify-between backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.01] ${getScoreColor(healthScore)}`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Điểm sức khỏe tài chính</span>
          <p className="text-xs">{getScoreMessage(healthScore)}</p>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-4xl font-extrabold font-mono tracking-tight">{healthScore}</span>
          <span className="text-zinc-500 text-xs font-medium">/ 100 Điểm</span>
        </div>
        <div className="w-full bg-zinc-800/60 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="h-full bg-current transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* 2. Savings Rate Progress */}
      <div className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-zinc-700/60 transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Tỷ lệ tích lũy hàng tháng</span>
          <p className="text-xs text-zinc-400">
            Dành dụm được <strong className="text-zinc-200">{formatVND(monthlySavings, true)}</strong> trên tổng {formatVND(income, true)} thu nhập.
          </p>
        </div>
        <div>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-mono text-zinc-200">{savingsRate.toFixed(1)}%</span>
            <span className="text-[10px] text-zinc-500">Mục tiêu: {savingsRate > 30 ? 'Đạt chuẩn tốt' : 'Nâng lên 30%'}</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 mt-2 overflow-hidden border border-zinc-850">
            <div
              className={`h-full ${savingsRate >= 30 ? 'bg-emerald-500' : 'bg-indigo-400'} transition-all duration-300`}
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Debt Shield Ratio */}
      <div className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-zinc-700/60 transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Hệ số lá chắn dư nợ</span>
          <p className="text-xs text-zinc-400">
            Duy trì nợ gốc <strong className="text-zinc-200">{formatVND(debt, true)}</strong> so với dòng vốn tiết kiệm {formatVND(savings, true)}.
          </p>
        </div>
        <div>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-mono text-zinc-200">
              {debt === 0 ? '0%' : `${debtToSavings.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-zinc-500">
              {debt === 0 ? 'Tuyệt đối an toàn' : debtToSavings < 30 ? 'Dưới ngưỡng rủi ro' : 'Cần cân nhắc trả bớt'}
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 mt-2 overflow-hidden border border-zinc-850">
            <div
              className={`h-full ${debt === 0 ? 'bg-emerald-500' : debtToSavings < 30 ? 'bg-indigo-400' : 'bg-red-400'} transition-all duration-300`}
              style={{ width: `${Math.min(100, debt === 0 ? 100 : debtToSavings)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetWorthChart;
