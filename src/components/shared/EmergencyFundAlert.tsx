/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface EmergencyFundAlertProps {
  months: number;
}

export function EmergencyFundAlert({ months }: EmergencyFundAlertProps) {
  const isCritical = months < 3;

  if (isCritical) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-sm text-amber-200">
              Quỹ dự phòng khẩn cấp chưa đạt chuẩn ({months} tháng)
            </h5>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bạn đang duy trì quỹ dự phòng ít hơn mức tối thiểu khuyến nghị (3 tháng sinh hoạt phí). Để tránh tình trạng phải thanh lý tài sản đầu tư sớm khi gặp biến cố dính cắt giảm nhân sự hoặc vấn đề sức khỏe, FinCopilot khuyến nghị bổ sung quỹ dự phòng đến tối thiểu 3-6 tháng trước khi tăng tỷ trọng vào danh mục mạo hiểm.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg p-4 space-y-2">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-semibold text-sm text-emerald-200">
            Quỹ dự phòng an toàn ({months} tháng)
          </h5>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tuyệt vời! Quỹ phòng vệ của bạn đang ở mức ổ định và vững chãi. Bạn hoàn toàn có thể chủ động đầu tư dài hạn định kỳ vào ETF hoặc các kênh gia tăng tài sản với tâm lý thư thái, thoải mái nhất.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmergencyFundAlert;
