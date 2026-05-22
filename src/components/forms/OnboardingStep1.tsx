/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VNDInput } from '../shared/VNDInput';

interface Step1Data {
  monthly_income_vnd: number;
  monthly_expenses_vnd: number;
  total_savings_vnd: number;
}

interface OnboardingStep1Props {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ data, onChange, onNext }: OnboardingStep1Props) {
  const isValid = data.monthly_income_vnd > 0 && data.monthly_expenses_vnd > 0 && data.total_savings_vnd >= 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-zinc-100 font-bold font-sans text-lg">Bước 1: Tình hình Tài chính Hiện tại</h3>
        <p className="text-zinc-400 text-xs">
          Thông tin thu nhập và tích sản ban đầu giúp Co-pilot xác định dòng tiền rảnh rỗi và hạn mức an toàn của bạn.
        </p>
      </div>

      <div className="space-y-4">
        {/* Monthly Income */}
        <div className="space-y-1.5 animate-fade-in">
          <label htmlFor="monthly_income" className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Thu nhập Chủ động hàng tháng
          </label>
          <VNDInput
            id="monthly_income"
            value={data.monthly_income_vnd}
            onChange={(val) => onChange({ monthly_income_vnd: val })}
            placeholder="Ví dụ: 30m hoặc 30.000.000 ₫"
          />
          <p className="text-[10px] text-zinc-500">Bao gồm lương gốc cố định và các thu nhập làm thêm cố định khác.</p>
        </div>

        {/* Monthly Expenses */}
        <div className="space-y-1.5">
          <label htmlFor="monthly_expenses" className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Chi tiêu sinh hoạt ước tính hàng tháng
          </label>
          <VNDInput
            id="monthly_expenses"
            value={data.monthly_expenses_vnd}
            onChange={(val) => onChange({ monthly_expenses_vnd: val })}
            placeholder="Ví dụ: 12tr hoặc 12.000.000 ₫"
          />
          <p className="text-[10px] text-zinc-500">Chi phí thiết yếu như nhà ở, sinh hoạt, ăn uống và đi lại thông thường.</p>
        </div>

        {/* Total Liquid Savings */}
        <div className="space-y-1.5">
          <label htmlFor="total_savings" className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Tổng số vốn / Tiết kiệm nhàn rỗi hiện có
          </label>
          <VNDInput
            id="total_savings"
            value={data.total_savings_vnd}
            onChange={(val) => onChange({ total_savings_vnd: val })}
            placeholder="Ví dụ: 100m hoặc 100.000.000 ₫"
          />
          <p className="text-[10px] text-zinc-500">Tổng tiền mặt, tiền gửi ngân hàng, quỹ tích lũy hiện có của bạn.</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`py-2 px-6 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
            isValid
              ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep1;
