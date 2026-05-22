/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatVND } from '../../lib/utils/vnd';

interface ScenarioCompareChartProps {
  monthlyContribution: number;
  sideBusinessReturn?: number; // e.g. 25 for 25% p.a.
  etfReturn?: number; // e.g. 11 for 11% p.a.
  bankReturn?: number; // e.g. 4 for 4% p.a.
  mixedReturn?: number; // weighted average
}

export function ScenarioCompareChart({
  monthlyContribution,
  sideBusinessReturn = 20,
  etfReturn = 11,
  bankReturn = 4,
  mixedReturn = 9,
}: ScenarioCompareChartProps) {
  
  // Calculate compounded wealth at N years with monthly additions
  const compoundBalance = (monthly: number, annualRate: number, years: number) => {
    let balance = 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = years * 12;
    for (let m = 0; m < totalMonths; m++) {
      balance = (balance + monthly) * (1 + monthlyRate);
    }
    return Math.round(balance);
  };

  const milestones = [1, 3, 5, 10];

  const chartData = milestones.map((year) => {
    return {
      milestone: `${year} Năm`,
      bank: compoundBalance(monthlyContribution, bankReturn, year),
      etf: compoundBalance(monthlyContribution, etfReturn, year),
      business: compoundBalance(monthlyContribution, sideBusinessReturn, year),
      mixed: compoundBalance(monthlyContribution, mixedReturn, year),
    };
  });

  const formatYAxisTick = (value: number) => {
    if (value === 0) return '0 ₫';
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)} Tỷ`;
    }
    if (value >= 1e6) {
      return `${Math.round(value / 1e6)} triệu`;
    }
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div className="w-full h-[400px] bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-zinc-100 font-semibold font-sans text-sm">So sánh Hiệu quả Tích lũy Hành trình</h4>
          <p className="text-zinc-550 text-zinc-500 text-xs">Mô phỏng 4 phương án đặt cạnh nhau tại mốc 1, 3, 5 và 10 năm</p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="milestone"
              stroke="#52525b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisTick}
              width={75}
            />
            <Tooltip
              formatter={(value: any) => [formatVND(Number(value)), '']}
              contentStyle={{
                backgroundColor: '#09090b',
                borderColor: '#27272a',
                borderRadius: '8px',
                color: '#f4f4f5',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
            />

            {/* Bank Savings */}
            <Bar
              name="Gửi Tiết kiệm (3.5% p.a.)"
              dataKey="bank"
              fill="#71717a"
              radius={[4, 4, 0, 0]}
            />

            {/* ETF DCA */}
            <Bar
              name="Tích sản ETF (11% p.a.)"
              dataKey="etf"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />

            {/* Side Business */}
            <Bar
              name="Tự Doanh phụ (20% p.a.)"
              dataKey="business"
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
            />

            {/* Recommended Mixed */}
            <Bar
              name="Hỗn hợp Co-pilot đề xuất"
              dataKey="mixed"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScenarioCompareChart;
