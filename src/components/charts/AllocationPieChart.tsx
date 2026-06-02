/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AllocationResponse } from '../../types';
import { formatVND } from '../../lib/utils/vnd';
import { useUI } from '../../contexts/UIContext';

interface AllocationPieChartProps {
  data: AllocationResponse;
}

const CATEGORY_MAP: Record<string, { label: string; color: string; description: string }> = {
  emergency_fund: {
    label: 'Quỹ dự phòng khẩn cấp',
    color: '#fbbf24', // Warning amber-400
    description: 'Chốt chặn an toàn tiền mặt gửi tiết kiệm kỳ hạn ngắn hoặc tài khoản tích lũy sinh lời nhanh.',
  },
  etf_dca: {
    label: 'Tích sản ETF DCA',
    color: '#10b981', // Primary emerald-500
    description: 'Mua định kỳ rổ VN30 (E1VFVN30) hoặc S&P500 để tích sản, hưởng lợi suất kép dài hạn.',
  },
  self_investment: {
    label: 'Đầu tư bản thân',
    color: '#6366f1', // Indigo-500
    description: 'Nâng cấp kỹ năng, chứng chỉ công nghệ, ngoại ngữ giúp tăng tốc thu nhập chủ động.',
  },
  business_capital: {
    label: 'Vốn kinh doanh thêm',
    color: '#a855f7', // Purple-500
    description: 'Vốn dự trù cho ý tưởng freelancer, dự án phụ (side hustle) nhằm đa dạng thu nhập.',
  },
  cash_reserve: {
    label: 'Tiền mặt chớp cơ hội',
    color: '#3b82f6', // Blue-500
    description: 'Tài khoản chờ giải ngân cơ hội hời khi thị trường cổ phiếu/bất động sản sụt sâu.',
  },
};

export function AllocationPieChart({ data }: AllocationPieChartProps) {
  const { theme } = useUI();
  const isDark = theme === 'dark';
  const { allocation } = data;
  const [selectedKey, setSelectedKey] = useState<string>('etf_dca');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = Object.entries(allocation).map(([key, item]) => {
    const info = CATEGORY_MAP[key] || { label: key, color: '#6b7280', description: '' };
    return {
      key,
      name: info.label,
      value: item.pct,
      amount: item.amount_vnd,
      reasoning: item.reasoning,
      color: info.color,
    };
  });

  const totalInvestable = Object.values(allocation).reduce((sum, item) => sum + item.amount_vnd, 0);

  const onPieClick = (state: any) => {
    if (state && state.key) {
      setSelectedKey(state.key);
    }
  };

  const selectedCategory = CATEGORY_MAP[selectedKey];
  const selectedItem = allocation[selectedKey];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Recharts Pie Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">
        <div className="relative w-64 h-64">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                onClick={onPieClick}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#18181b"
                    strokeWidth={4}
                    style={{
                      outline: 'none',
                      opacity: selectedKey === entry.key ? 1 : 0.7,
                      transform: selectedKey === entry.key ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: string, props: any) => [
                  `${value}% (${formatVND(props.payload.amount)})`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#d4d4de',
                  borderRadius: '6px',
                  color: isDark ? '#f4f4f5' : '#18181b',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
          {/* Central Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-zinc-500 text-xs uppercase tracking-widest">Tổng phân bổ</span>
            <span className="text-zinc-100 font-bold text-lg font-sans">
              {formatVND(totalInvestable, true)}
            </span>
          </div>
        </div>
        
        {/* Custom Legends list */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs w-full max-w-sm">
          {chartData.map((entry) => (
            <button
              key={entry.key}
              onClick={() => setSelectedKey(entry.key)}
              className={`flex items-center gap-2 p-1 text-left rounded-md hover:bg-zinc-850 transition-colors ${
                selectedKey === entry.key ? 'text-zinc-100 font-semibold bg-zinc-800/50' : 'text-zinc-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name} ({entry.value}%)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Details Card Section */}
      <div className="w-full lg:w-1/2 bg-zinc-950 p-4 border border-zinc-850 rounded-lg space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: selectedCategory?.color || '#eee' }}
          />
          <h4 className="text-zinc-100 font-semibold font-sans text-sm">
            {selectedCategory?.label} ({selectedItem?.pct}%)
          </h4>
        </div>
        <p className="text-emerald-400 font-bold text-lg">
          {formatVND(selectedItem?.amount_vnd || 0)}
        </p>
        <p className="text-zinc-400 text-xs font-mono leading-relaxed bg-zinc-900 border border-zinc-850 p-2.5 rounded p-3 leading-relaxed">
          {selectedCategory?.description}
        </p>
        <div className="bg-zinc-900/40 p-3 rounded-md border border-zinc-900">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1">
            Ý kiến co-pilot tài chính
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed italic">
            "{selectedItem?.reasoning}"
          </p>
        </div>
      </div>
    </div>
  );
}

export default AllocationPieChart;
