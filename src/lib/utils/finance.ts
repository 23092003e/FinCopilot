/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatVND } from './vnd';

export { formatVND };

export interface DCAPoint {
  year: number;
  contributed: number;
  nominal: number;
  real: number;
}

/**
 * Compound DCA Calculator.
 * Calculates month-by-month compounding and returns annual snapshots.
 */
export function calculateDCA(params: {
  monthlyContribution: number;  // VND
  annualReturnPct: number;      // e.g. 12 for 12%
  years: number;
  inflationPct: number;         // e.g. 3.5 for 3.5%
}): DCAPoint[] {
  const { monthlyContribution, annualReturnPct, years, inflationPct } = params;
  const result: DCAPoint[] = [];
  
  // Year 0 baseline
  result.push({
    year: 0,
    contributed: 0,
    nominal: 0,
    real: 0,
  });

  let currentNominal = 0;
  const monthlyRate = (annualReturnPct / 100) / 12;

  for (let y = 1; y <= years; y++) {
    // Simulate 12 months for this year
    for (let m = 0; m < 12; m++) {
      currentNominal = (currentNominal + monthlyContribution) * (1 + monthlyRate);
    }
    
    const totalContributed = y * 12 * monthlyContribution;
    
    // Inflation discount factor (inflation is annual compounding)
    const inflationFactor = Math.pow(1 + (inflationPct / 100), y);
    const currentReal = currentNominal / inflationFactor;

    result.push({
      year: y,
      contributed: Math.round(totalContributed),
      nominal: Math.round(currentNominal),
      real: Math.round(currentReal),
    });
  }

  return result;
}

/**
 * Assess emergency fund status.
 * Prerequisite logic: Young professionals need 3-6 months.
 */
export function emergencyFundStatus(params: {
  currentFund: number;
  monthlyExpenses: number;
}): { months: number; status: 'critical' | 'low' | 'good' | 'excellent'; message: string } {
  const { currentFund, monthlyExpenses } = params;
  
  if (!monthlyExpenses || monthlyExpenses <= 0) {
    return {
      months: 0,
      status: 'critical',
      message: 'Vui lòng bổ sung chi phí sinh hoạt hàng tháng để tính toán.',
    };
  }

  const months = Math.round((currentFund / monthlyExpenses) * 10) / 10;

  if (months < 3) {
    return {
      months,
      status: 'critical',
      message: `Cảnh báo: Quỹ dự phòng của bạn chỉ đủ cho ${months} tháng chi tiêu (dưới mức tối thiểu 3 tháng). Hãy ưu tiên tích lũy phòng vệ trước khi bắt đầu đầu tư tích sản.`,
    };
  } else if (months < 6) {
    return {
      months,
      status: 'low',
      message: `An toàn: Quỹ dự phòng của bạn đạt ${months} tháng chi tiêu. Nên duy trì từ 3-6 tháng trước khi tăng tỷ trọng vào các kênh tài sản biến động cao.`,
    };
  } else if (months <= 12) {
    return {
      months,
      status: 'good',
      message: `Rất tốt: Quỹ dự phòng đạt ${months} tháng chi tiêu. Bạn đã xây dựng được bệ đỡ tài chính vững chắc, sẵn sàng phân bổ tích sản dài hạn.`,
    };
  } else {
    return {
      months,
      status: 'excellent',
      message: `Xuất sắc: Bạn có ${months} tháng chi tiêu dự phòng. Tuy nhiên, có thể xem xét tối ưu bớt tiền mặt thừa để chuyển dòng tiền nhàn rỗi vào DCA VN30 hoặc các quỹ ETF để tránh lạm phát bào mòn sức mua.`,
    };
  }
}
