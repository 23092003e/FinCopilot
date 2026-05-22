/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { VNDInput } from '../components/shared/VNDInput';
import { DCAGrowthChart } from '../components/charts/DCAGrowthChart';
import { calculateDCA, DCAPoint } from '../lib/utils/finance';
import { formatVND } from '../lib/utils/vnd';
import { HelpCircle, Landmark, Award, ArrowUpRight } from 'lucide-react';

interface SimulatorProps {
  onSaveSimulation?: (sim: any) => void;
  savedSim?: any;
}

const INSTRUMENTS_PRESETS = [
  { id: 'VN30', label: 'Rổ VN30 ETF (E1VFVN30)', returnPct: 11, desc: 'Ưu chuộng tích sản chứng chỉ quỹ nội địa.' },
  { id: 'SP500', label: 'S&P 500 Index Fund', returnPct: 10, desc: 'Chứng chỉ toàn cầu tích sản đại diện 500 tập đoàn lớn nhất Hoa Kỳ.' },
  { id: 'bank', label: 'Gửi Ngân hàng Kỳ hạn dài', returnPct: 4, desc: 'An toàn bảo toàn vốn nhưng chịu rủi ro giảm sức mua.' },
  { id: 'custom', label: 'Tùy chọn tự doanh / tùy chỉnh', returnPct: 18, desc: 'Phản ánh lãi kép từ hoạt động buôn bán phụ hoặc kinh doanh.' },
];

export function Simulator({ onSaveSimulation, savedSim }: SimulatorProps) {
  // Simulator inputs
  const [contribution, setContribution] = useState<number>(10000000); // 10 million default
  const [returnPct, setReturnPct] = useState<number>(11);
  const [years, setYears] = useState<number>(10);
  const [inflation, setInflation] = useState<number>(3.5);
  const [selectedInst, setSelectedInst] = useState<string>('VN30');

  const [chartData, setChartData] = useState<DCAPoint[]>([]);

  // Trigger recalculation upon input alterations (debounced/instantaneous is fast enough in standard react state)
  useEffect(() => {
    const rawData = calculateDCA({
      monthlyContribution: contribution,
      annualReturnPct: returnPct,
      years: years,
      inflationPct: inflation,
    });
    setChartData(rawData);

    if (onSaveSimulation) {
      onSaveSimulation({
        monthly_contribution_vnd: contribution,
        annual_return_pct: returnPct,
        years,
        inflation_pct: inflation,
        instrument: selectedInst,
        result_json: rawData,
      });
    }
  }, [contribution, returnPct, years, inflation, selectedInst]);

  const handlePresetSelect = (preset: typeof INSTRUMENTS_PRESETS[0]) => {
    setSelectedInst(preset.id);
    setReturnPct(preset.returnPct);
  };

  const finalPoint = chartData[chartData.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="DCA Money Simulator"
        subtitle="Mô phỏng sức mạnh lãi kép của thói quen tích sản định kỳ và ước tính sụt lún tài sản do lạm phát dài hạn."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-1 backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-5 space-y-5 shadow-xl">
          <h3 className="text-zinc-200 text-sm font-bold border-b border-zinc-850 pb-2 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Tham số Tích lũy hàng tháng
          </h3>

          <div className="space-y-4">
            
            {/* Monthly saving amount */}
            <div className="space-y-1.5">
              <label htmlFor="sim_contribution" className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                Số tiền giải ngân định kỳ (VND/tháng)
              </label>
              <VNDInput
                id="sim_contribution"
                value={contribution}
                onChange={(val) => setContribution(val)}
                placeholder="Nhập số tiền tích sản hàng tháng..."
              />
              <p className="text-[10px] text-zinc-500">Mức tiền trích ra cố định ngay khi được lĩnh lương.</p>
            </div>

            {/* Instrument selector presets */}
            <div className="space-y-1.5">
              <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                Kênh tích sản khuyên dùng
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {INSTRUMENTS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-1.5 px-2 rounded border text-center transition-all leading-normal ${
                      selectedInst === preset.id
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    {preset.id === 'VN30' ? 'VN30 ETF' : preset.id === 'SP500' ? 'S&P 500' : preset.id === 'bank' ? 'Ngân hàng' : 'Tự kinh doanh'}
                  </button>
                ))}
              </div>
            </div>

            {/* Yearly compounded return percentage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="sim_return" className="uppercase tracking-wider text-zinc-400 font-semibold">
                  Tỷ suất lợi nhuận bình quân (%/năm)
                </label>
                <span className="text-emerald-400 font-mono font-bold">{returnPct}% p.a</span>
              </div>
              <input
                id="sim_return"
                type="range"
                min={2}
                max={30}
                step={0.5}
                value={returnPct}
                onChange={(e) => {
                  setReturnPct(parseFloat(e.target.value));
                  setSelectedInst('custom');
                }}
                className="w-full accent-emerald-500 bg-zinc-950 rounded h-1 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-550 text-zinc-500">VN30 tích sản thực tế đạt ~10-12% dài hạn.</span>
            </div>

            {/* Multi-year period */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="sim_years" className="uppercase tracking-wider text-zinc-400 font-semibold">
                  Chu kỳ tích lũy (Năm)
                </label>
                <span className="text-emerald-400 font-mono font-bold">{years} Năm</span>
              </div>
              <input
                id="sim_years"
                type="range"
                min={1}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-950 rounded h-1 cursor-pointer"
              />
            </div>

            {/* Inflation rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="sim_inflation" className="uppercase tracking-wider text-zinc-400 font-semibold">
                  Tỷ lệ lạm phát kỳ vọng bình quân (%/năm)
                </label>
                <span className="text-zinc-400 font-mono font-bold">{inflation}%</span>
              </div>
              <input
                id="sim_inflation"
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={inflation}
                onChange={(e) => setInflation(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 bg-zinc-950 rounded h-1 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-550 text-zinc-550 text-zinc-500">Bình quân lạm phát CPI Việt Nam ở mức ~3-4%/năm.</span>
            </div>

          </div>
        </div>

        {/* Right Side: Growth Chart and Numbers card */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick numbers overview */}
          {finalPoint && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="backdrop-blur-md bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3.5 space-y-1 shadow-sm">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Tổng vốn gốc góp</span>
                <p className="text-zinc-200 font-bold text-sm tracking-tight">{formatVND(finalPoint.contributed)}</p>
                <span className="text-[10px] text-zinc-550 text-zinc-500 leading-none">vốn tích lũy túi phát</span>
              </div>
              
              <div className="backdrop-blur-md bg-zinc-900/65 border border-emerald-500/15 rounded-xl p-3.5 space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.02)]">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Tài sản tích sản tích lũy</span>
                <p className="text-emerald-400 font-extrabold text-sm tracking-tight">{formatVND(finalPoint.nominal)}</p>
                <span className="text-[10px] text-emerald-500/70 font-mono leading-none">
                  Lợi khuyển lãi kép: +{((finalPoint.nominal - finalPoint.contributed) / finalPoint.contributed * 100).toFixed(0)}%
                </span>
              </div>

              <div className="backdrop-blur-md bg-zinc-900/40 border border-indigo-500/15 rounded-xl p-3.5 space-y-1 shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Giá trị thực tế (trừ lạm phát)</span>
                <p className="text-indigo-400 font-bold text-sm tracking-tight">{formatVND(finalPoint.real)}</p>
                <span className="text-[10px] text-zinc-550 text-zinc-500 leading-none">bằng sức mua quy đổi năm thứ 0</span>
              </div>
            </div>
          )}

          {/* DCA growth chart component */}
          <DCAGrowthChart data={chartData} />

          {/* Quick descriptive tips */}
          <div className="backdrop-blur-md bg-zinc-950/65 p-4 border border-zinc-900 rounded-xl flex items-start gap-3 shadow-md">
            <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-200 font-sans block">Sức mạnh kỳ diệu của việc Kỷ luật DCA</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Tích lũy tài sản dài hạn không phụ thuộc quá nhiều vào thời điểm thị trường chứng khoán lên hay xuống, mà phụ thuộc hoàn toàn vào tần suất giải ngân kỷ luật tuyệt đối của dòng tiền nhàn rỗi. Giải ngân đầu tháng bất luận điều kiện vĩ mô giúp san bằng biến động ngắn hạn một cách xuất sắc nhất.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Simulator;
