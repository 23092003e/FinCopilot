/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { formatVND, parseVND } from '../../lib/utils/vnd';

interface VNDInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export function VNDInput({ id, value, onChange, className = '', placeholder = '0 ₫' }: VNDInputProps) {
  // Store the user typed input as raw text when typing, and standardized text on blur
  const [inputValue, setInputValue] = useState<string>('');

  // Sychronize with value changes from parent (e.g. from state loads)
  useEffect(() => {
    if (value === 0) {
      setInputValue('');
    } else {
      setInputValue(formatVND(value));
    }
  }, [value]);

  const handleFocus = () => {
    if (value !== 0) {
      // Show numerical representation natively on focus for zero-friction editing
      setInputValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseVND(inputValue);
    onChange(parsed);
    setInputValue(parsed > 0 ? formatVND(parsed) : '');
  };

  const parsedLive = parseVND(inputValue);

  const getLiveHelperText = () => {
    if (parsedLive <= 0) return '';
    if (parsedLive >= 1e9) {
      const b = parsedLive / 1e9;
      return `${b % 1 === 0 ? b : b.toFixed(2).replace(/\.00$/, '')} tỷ`;
    }
    if (parsedLive >= 1e6) {
      const m = parsedLive / 1e6;
      return `${m % 1 === 0 ? m : m.toFixed(2).replace(/\.00$/, '')} triệu`;
    }
    if (parsedLive >= 1e3) {
      const k = parsedLive / 1e3;
      return `${k % 1 === 0 ? k : k.toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${parsedLive}`;
  };

  const liveLabel = getLiveHelperText();

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 rounded-xl py-2.5 pl-3.5 pr-20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium transition-all duration-200 placeholder-zinc-600 ${className}`}
      />
      {liveLabel && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold uppercase py-0.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 select-none pointer-events-none transition-all">
          {liveLabel}
        </span>
      )}
    </div>
  );
}

export default VNDInput;
