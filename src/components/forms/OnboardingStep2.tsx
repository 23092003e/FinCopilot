/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { VNDInput } from '../shared/VNDInput';

interface Step2Data {
  has_emergency_fund: boolean;
  emergency_fund_months: number;
  emergency_fund_amount?: number; // local state helper
  has_debt: boolean;
  debt_amount_vnd: number;
  has_insurance: boolean;
}

interface Step1Summary {
  monthly_expenses_vnd: number;
}

interface OnboardingStep2Props {
  data: Step2Data;
  step1: Step1Summary;
  onChange: (updates: Partial<Step2Data>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function OnboardingStep2({ data, step1, onChange, onNext, onPrev }: OnboardingStep2Props) {
  // If user says has_emergency_fund, let's default the amount to 3 months of expenses
  const expense = step1.monthly_expenses_vnd || 10000000;
  const currentFundAmount = data.emergency_fund_amount ?? (data.has_emergency_fund ? data.emergency_fund_months * expense : 0);

  const handleFundChange = (amount: number) => {
    const months = expense > 0 ? Math.round((amount / expense) * 10) / 10 : 0;
    onChange({
      emergency_fund_amount: amount,
      emergency_fund_months: months,
    });
  };

  const handleDebtToggle = (has: boolean) => {
    onChange({
      has_debt: has,
      debt_amount_vnd: has ? data.debt_amount_vnd || 10000000 : 0,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-zinc-100 font-bold font-sans text-lg">Bước 2: Phòng Vệ và Dư Nợ</h3>
        <p className="text-zinc-400 text-xs">
          Trụ cột tài chính vững chãi được xây trên lá chắn phòng vệ xuất sắc. Co-pilot cần rà soát nợ xấu và quỹ bảo vệ.
        </p>
      </div>

      <div className="space-y-5">
        {/* Emergency Fund Check */}
        <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Quỹ dự phòng khẩn cấp</span>
              <span className="text-[10px] text-zinc-500">Tiền mặt dự phòng khi mất thu nhập đột ngột</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ has_emergency_fund: !data.has_emergency_fund })}
              className={`py-1 px-3 rounded text-xs font-semibold border transition-all ${
                data.has_emergency_fund
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {data.has_emergency_fund ? 'ĐÃ CÓ' : 'CHƯA CÓ'}
            </button>
          </div>

          {data.has_emergency_fund && (
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label htmlFor="emergency_fund_amt" className="block text-[11px] text-zinc-400">
                Giá trị quỹ dự phòng hiện có (VND)
              </label>
              <VNDInput
                id="emergency_fund_amt"
                value={currentFundAmount}
                onChange={handleFundChange}
                placeholder="Nhập số tiền dự phòng ví dụ: 30m"
              />
              <p className="text-[10px] text-zinc-400">
                Tương đương <strong className="text-emerald-400 font-mono">{(currentFundAmount / expense).toFixed(1)}</strong> tháng chi tiêu ước tính của bạn ({expense.toLocaleString('vi-VN')} ₫/tháng).
              </p>
            </div>
          )}
        </div>

        {/* Debt Check */}
        <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Dư nợ hiện tại</span>
              <span className="text-[10px] text-zinc-500">Các khoản vay credit card, vay mua xe/nhà, vay bạn bè</span>
            </div>
            <button
              type="button"
              onClick={() => handleDebtToggle(!data.has_debt)}
              className={`py-1 px-3 rounded text-xs font-semibold border transition-all ${
                data.has_debt
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {data.has_debt ? 'ĐANG CÓ NỢ' : 'KHÔNG CÓ NỢ'}
            </button>
          </div>

          {data.has_debt && (
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label htmlFor="debt_amt" className="block text-[11px] text-zinc-400">Tổng dư nợ gốc hiện tại (VND)</label>
              <VNDInput
                id="debt_amt"
                value={data.debt_amount_vnd}
                onChange={(val) => onChange({ debt_amount_vnd: val })}
                placeholder="Nhập dư nợ gốc ví dụ: 50m"
              />
            </div>
          )}
        </div>

        {/* Insurance Check */}
        <div className="flex items-center justify-between bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <div className="space-y-0.5">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Bảo hiểm sức khỏe / Nhân thọ</span>
            <span className="text-[10px] text-zinc-500">Giảm thiểu rủi ro y tế đè nặng lên tài sản tiết kiệm</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ has_insurance: !data.has_insurance })}
            className={`py-1 px-3 rounded text-xs font-semibold border transition-all ${
              data.has_insurance
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {data.has_insurance ? 'CÓ BẢO HIỂM' : 'CHƯA TRANG BỊ'}
          </button>
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          onClick={onPrev}
          className="py-2 px-4 rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 text-sm transition-all focus:outline-none focus:ring-0"
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          className="py-2 px-6 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/20 cursor-pointer"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep2;
