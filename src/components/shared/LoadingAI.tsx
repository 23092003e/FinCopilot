/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LoadingAIProps {
  message?: string;
}

const VIETNAMESE_QUOTES = [
  'Đang quét lịch sử tài chính cá nhân...',
  'Đối chiếu hồ sơ với dữ liệu lịch sử tăng trưởng rổ VN30...',
  'Tính toán tỷ lệ quỹ dự phòng rủi ro bảo vệ dòng tiền...',
  'Tính toán cơ cấu đầu tư nâng cao năng suất chuyên môn cốt lõi...',
  'Xem xét tác động lãi suất vay ngân hàng và lạm phát...',
  'Phác thảo tỷ lệ phân bổ tối ưu nhất dựa theo mức chịu rủi ro...',
];

export function LoadingAI({ message = 'FinCopilot đang tính toán...' }: LoadingAIProps) {
  const [subText, setSubText] = useState(VIETNAMESE_QUOTES[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % VIETNAMESE_QUOTES.length;
      setSubText(VIETNAMESE_QUOTES[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-lg max-w-md mx-auto text-center space-y-4 shadow-xl">
      <div className="relative w-16 h-16">
        {/* Animated outer glowing loops */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30"
        />
        <motion.div
          animate={{ scale: [0.95, 1.15, 0.95], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-2 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500"
        >
          <span className="text-emerald-400 font-bold font-mono text-sm">AI</span>
        </motion.div>
      </div>

      <div className="space-y-1.5 w-full">
        <h4 className="text-zinc-200 font-medium text-sm animate-pulse">{message}</h4>
        <p className="text-zinc-500 text-xs font-mono h-4 overflow-hidden transition-all duration-300">
          {subText}
        </p>
      </div>

      <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden border border-zinc-850">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="bg-emerald-500 h-full w-1/3"
        />
      </div>
    </div>
  );
}

export default LoadingAI;
