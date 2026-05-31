/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, Target, ShieldAlert, Award } from 'lucide-react';

interface Step3Data {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | null;
  investment_knowledge: 'beginner' | 'intermediate' | 'advanced' | null;
  career_field: 'software' | 'ai_ml' | 'design' | 'marketing' | 'finance' | 'freelance' | 'other' | null;
  skills: string[];
  financial_goals: string[];
}

interface OnboardingStep3Props {
  data: Step3Data;
  onChange: (updates: Partial<Step3Data>) => void;
  onFinish: () => void;
  onPrev: () => void;
}

const CAREERS = [
  { value: 'software', label: 'Phát triển Phần mềm' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'design', label: 'Design (UI/UX, Graphic)' },
  { value: 'marketing', label: 'Marketing / Growth' },
  { value: 'finance', label: 'Tài chính / Đầu tư' },
  { value: 'freelance', label: 'Freelancer Tự do' },
  { value: 'other', label: 'Lĩnh vực khác' },
];

const SKILL_SUGGESTIONS = [
  'React / Next.js', 'Python', 'AI Prompts', 'Data Analysis',
  'UI/UX Figma', 'Google Ads / SEO', 'SQL / Database', 'Copywriting',
  'English Chatting', 'Project Management', 'Video Editing'
];

const GOAL_SUGGESTIONS = [
  { value: 'house_2years', label: 'Mua nhà (2-3 năm tới)' },
  { value: 'early_retire', label: 'Nghỉ hưu sớm (F.I.R.E)' },
  { value: 'side_business', label: 'Tích lũy vốn tự doanh phụ' },
  { value: 'buy_car', label: 'Tích lũy mua ô tô' },
  { value: 'study_abroad', label: 'Du học / Học cao học' },
  { value: 'family_fund', label: 'Lập gia đình / Quỹ con cái' }
];

export function OnboardingStep3({ data, onChange, onFinish, onPrev }: OnboardingStep3Props) {
  const [skillInput, setSkillInput] = useState('');

  const toggleSkill = (skill: string) => {
    const fresh = data.skills.includes(skill)
      ? data.skills.filter((s) => s !== skill)
      : [...data.skills, skill];
    onChange({ skills: fresh });
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !data.skills.includes(clean)) {
      onChange({ skills: [...data.skills, clean] });
      setSkillInput('');
    }
  };

  const toggleGoal = (goal: string) => {
    const fresh = data.financial_goals.includes(goal)
      ? data.financial_goals.filter((g) => g !== goal)
      : [...data.financial_goals, goal];
    onChange({ financial_goals: fresh });
  };

  const isFormValid =
    data.risk_tolerance !== null &&
    data.investment_knowledge !== null &&
    data.career_field !== null &&
    data.financial_goals.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-zinc-100 font-bold font-sans text-lg">Bước 3: Hồ sơ Rủi ro và Kế hoạch bản thân</h3>
        <p className="text-zinc-400 text-xs">
          Thông tin nghành nghề, kỹ năng và mức độ rủi ro giúp AI lập kế hoạch DCA tích sản và đề xuất side hustle đột phá thu nhập.
        </p>
      </div>

      <div className="space-y-5 text-sm">
        {/* 1. Career Field Selection */}
        <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Lĩnh vực nghề nghiệp chính
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CAREERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ career_field: item.value as any })}
                className={`py-1.5 px-2.5 rounded text-xs font-medium border text-center transition-all ${
                  data.career_field === item.value
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Risk Tolerance Selection */}
        <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Khẩu vị chịu rủi ro đầu tư
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onChange({ risk_tolerance: 'conservative' })}
              className={`p-3 text-left rounded-lg border flex flex-col space-y-1 transition-all ${
                data.risk_tolerance === 'conservative'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <span className={`text-xs font-bold ${data.risk_tolerance === 'conservative' ? 'text-emerald-400' : 'text-zinc-200'}`}>Thận trọng</span>
              <span className="text-[10px] text-zinc-450 text-zinc-400 leading-normal">Bảo toàn vốn, gửi tiết kiệm + nợ tốt, đầu tư chứng khoán tỷ trọng thấp.</span>
            </button>
            
            <button
              type="button"
              onClick={() => onChange({ risk_tolerance: 'moderate' })}
              className={`p-3 text-left rounded-lg border flex flex-col space-y-1 transition-all ${
                data.risk_tolerance === 'moderate'
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <span className={`text-xs font-bold ${data.risk_tolerance === 'moderate' ? 'text-indigo-400' : 'text-zinc-200'}`}>Trung hòa</span>
              <span className="text-[10px] text-zinc-450 text-zinc-400 leading-normal">Cân bằng tối ưu giữa quỹ an toàn và đầu tư ETF cổ phiếu tăng trưởng kép.</span>
            </button>
            
            <button
              type="button"
              onClick={() => onChange({ risk_tolerance: 'aggressive' })}
              className={`p-3 text-left rounded-lg border flex flex-col space-y-1 transition-all ${
                data.risk_tolerance === 'aggressive'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <span className={`text-xs font-bold ${data.risk_tolerance === 'aggressive' ? 'text-red-400' : 'text-zinc-200'}`}>Mạo hiểm / Tăng tốc</span>
              <span className="text-[10px] text-zinc-450 text-zinc-400 leading-normal">Giải ngân mạnh vào ETF kỳ vọng tỷ lệ sinh lời đột phá lâu dài.</span>
            </button>
          </div>
        </div>

        {/* 3. Investment Knowledge */}
        <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
            <Award className="w-4 h-4 text-emerald-400" />
            Kiến thức tài chính đầu tư
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ investment_knowledge: k })}
                className={`py-1.5 px-2.5 rounded text-xs font-medium border text-center capitalize transition-all ${
                  data.investment_knowledge === k
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {k === 'beginner' ? 'F0 / Mới' : k === 'intermediate' ? 'Có Kinh Nghiệm' : 'Đã Am Hiểu'}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Skills select chips */}
        <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
            Kỹ năng cá nhân sẵn có
          </span>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {SKILL_SUGGESTIONS.map((skill) => {
              const active = data.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`py-1 px-2.5 rounded-full text-[11px] transition-all border ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                      : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-750'
                  }`}
                >
                  {active ? '✓' : '+'} {skill}
                </button>
              );
            })}
          </div>
          <form onSubmit={addCustomSkill} className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Thêm kỹ năng khác..."
              className="bg-zinc-900 outline-none border border-zinc-800 rounded px-2.5 py-1 text-xs flex-1 text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              className="py-1 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 rounded text-xs text-zinc-200 font-medium"
            >
              Thêm
            </button>
          </form>
        </div>

        {/* 5. Financial Goals */}
        <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            <Target className="w-4 h-4 text-emerald-400" />
            Mục tiêu tài chính quan trọng hàng đầu (Chọn ít nhất 1)
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_SUGGESTIONS.map((goal) => {
              const active = data.financial_goals.includes(goal.value);
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => toggleGoal(goal.value)}
                  className={`py-1.5 px-3 rounded-md text-xs transition-all border ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {goal.label}
                </button>
              );
            })}
          </div>
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
          onClick={onFinish}
          disabled={!isFormValid}
          className={`py-2 px-6 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
            isFormValid
              ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Hoàn thành thiết lập
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep3;
