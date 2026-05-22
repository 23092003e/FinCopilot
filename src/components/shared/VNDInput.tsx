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
      // Show numeric string or clean formatted string on focus to make editing easier
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
        className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md py-2 px-3 focus:outline-none focus:border-emerald-500 font-medium ${className}`}
      />
      {value > 0 && (
        <span className="absolute right-3 top-2.5 text-xs text-zinc-500 select-none">
          {parseVND(inputValue) >= 1e6 ? `${(parseVND(inputValue) / 1e6).toFixed(1)} triệu VND` : ''}
        </span>
      )}
    </div>
  );
}

export default VNDInput;
