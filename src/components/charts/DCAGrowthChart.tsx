/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DCAPoint } from '../../lib/utils/finance';
import { formatVND } from '../../lib/utils/vnd';
import { useUI } from '../../contexts/UIContext';

interface DCAGrowthChartProps {
  data: DCAPoint[];
}

export function DCAGrowthChart({ data }: DCAGrowthChartProps) {
  const { theme } = useUI();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Format Y Axis ticks (e.g. 500M, 2B ₫)
  const formatYAxisTick = (value: number) => {
    if (value === 0) return '0 ₫';
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B ₫`;
    }
    if (value >= 1e6) {
      return `${Math.round(value / 1e6)}M ₫`;
    }
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  const finalPoint = data[data.length - 1];
  const breakEvenValue = finalPoint ? finalPoint.contributed : 0;

  return (
    <div className="w-full h-[380px] bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-zinc-100 font-semibold font-sans text-sm">Biểu đồ Tăng trưởng Tích sản (DCA)</h4>
          <p className="text-zinc-500 text-xs">Mô phỏng 3 đường song song phản ánh sức mạnh lãi kép và lạm phát bảo mòn</p>
        </div>
        {finalPoint && (
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Tài sản sau {finalPoint.year} năm</span>
            <span className="text-emerald-400 font-bold text-sm select-all">
              {formatVND(finalPoint.nominal)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[220px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
            <defs>
              <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4f4f5" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f4f4f5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4eb'} vertical={false} />
            
            <XAxis
              dataKey="year"
              stroke={isDark ? '#52525b' : '#717180'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(y) => `Năm ${y}`}
            />
            
            <YAxis
              stroke={isDark ? '#52525b' : '#717180'}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisTick}
              width={75}
            />

            <Tooltip
              formatter={(value: any) => [formatVND(Number(value)), '']}
              labelFormatter={(label) => `Năm thứ ${label}`}
              contentStyle={{
                backgroundColor: isDark ? '#09090b' : '#ffffff',
                borderColor: isDark ? '#27272a' : '#d4d4de',
                borderRadius: '8px',
                color: isDark ? '#f4f4f5' : '#18181b',
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

            {/* Reference Line to show bottom-line money saved */}
            {breakEvenValue > 0 && (
              <ReferenceLine
                y={breakEvenValue}
                stroke="#71717a"
                strokeDasharray="4 4"
                label={{
                  value: `Vốn gốc: ${formatYAxisTick(breakEvenValue)}`,
                  fill: '#a1a1aa',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}

            {/* Nominal Growth */}
            <Area
              name="Giá trị tài sản danh nghĩa"
              type="monotone"
              dataKey="nominal"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNominal)"
            />

            {/* Inflation-Adjusted Real Value */}
            <Area
              name="Giá trị thực tực tế (Trừ lạm phát)"
              type="monotone"
              dataKey="real"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReal)"
            />

            {/* Cumulative Contributions */}
            <Area
              name="Tổng số vốn góp gốc"
              type="monotone"
              dataKey="contributed"
              stroke={isDark ? '#e4e4e7' : '#52525b'}
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorContributed)"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      </div>
    </div>
  );
}

export default DCAGrowthChart;
