/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RiskBadgeProps {
  id?: string;
  risk: 'conservative' | 'moderate' | 'aggressive' | 'low' | 'high' | string;
}

export function RiskBadge({ id, risk }: RiskBadgeProps) {
  const normalized = risk?.toLowerCase();

  if (normalized === 'conservative' || normalized === 'low') {
    return (
      <span id={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        An toàn (Conservative / Low)
      </span>
    );
  }

  if (normalized === 'aggressive' || normalized === 'high') {
    return (
      <span id={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        Mạo hiểm (Aggressive / High)
      </span>
    );
  }

  return (
    <span id={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      Tăng trưởng (Moderate)
    </span>
  );
}

export default RiskBadge;
