/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { OnboardingStep1 } from '../components/forms/OnboardingStep1';
import { OnboardingStep2 } from '../components/forms/OnboardingStep2';
import { OnboardingStep3 } from '../components/forms/OnboardingStep3';
import { Profile } from '../lib/supabase/types';
import { Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface OnboardingProps {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  setActiveTab: (tab: string) => void;
}

export function Onboarding({ profile, updateProfile, setActiveTab }: OnboardingProps) {
  const { language, t } = useUI();
  const [currentStep, setCurrentStep] = useState(1);
  const [draftSaved, setDraftSaved] = useState(false);

  // Read draft state from profile prop
  const [formData, setFormData] = useState<Profile>({ ...profile });

  const handleDataChange = (updates: any) => {
    setFormData((prev) => {
      const fresh = { ...prev, ...updates };
      // Proactively triggers local draft saving state for pristine UX
      return fresh;
    });
  };

  const saveDraft = () => {
    // Sync actual profile state
    updateProfile(formData);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleNext = () => {
    // Save draft on every step navigation as specified
    updateProfile(formData);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    // Complete onboarding status
    const finalized = {
      ...formData,
      onboarding_completed: true,
    };
    updateProfile(finalized);
    setActiveTab('advisor'); // redirect to advisor immediately to let them calculate their asset split!
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={language === 'vi' ? 'Thiết Lập Hồ Sơ FinCopilot' : 'FinCopilot Profile Setup'}
        subtitle={language === 'vi' ? 'Vui lòng hoàn thiện đúng 3 bước khảo sát nhanh để xây dựng chiến lược DCA tài sản và rà soát bệ đỡ phòng vệ trọn vẹn nhất.' : 'Complete our quick 3-step survey to craft your customized asset DCA strategy and stress-test your safety reserves.'}
        action={
          <button
            onClick={saveDraft}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? (draftSaved ? 'Đã lưu nháp!' : 'Lưu bản nháp') : (draftSaved ? 'Draft Saved!' : 'Save Draft')}</span>
          </button>
        }
      />

      {/* Progress Stepper Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex justify-between items-center text-xs mb-3">
          <span className="text-zinc-500 uppercase tracking-widest font-semibold font-mono">
            {language === 'vi' ? 'Tiến độ hoàn thành' : 'Onboarding Progress'}
          </span>
          <span className="text-emerald-400 font-bold font-mono">
            {language === 'vi' ? `Bước ${currentStep} trên 3` : `Step ${currentStep} of 3`}
          </span>
        </div>
        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-850 flex gap-1">
          <div
            className={`h-full rounded-r-sm transition-all duration-300 ${
              currentStep >= 1 ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
            style={{ width: '33.3%' }}
          />
          <div
            className={`h-full rounded-sm transition-all duration-300 ${
              currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
            style={{ width: '33.3%' }}
          />
          <div
            className={`h-full rounded-l-sm transition-all duration-300 ${
              currentStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
            style={{ width: '33.3%' }}
          />
        </div>
      </div>

      {/* Active Form Step Router */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
        {currentStep === 1 && (
          <OnboardingStep1
            data={{
              monthly_income_vnd: formData.monthly_income_vnd,
              monthly_expenses_vnd: formData.monthly_expenses_vnd,
              total_savings_vnd: formData.total_savings_vnd,
            }}
            onChange={handleDataChange}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <OnboardingStep2
            data={{
              has_emergency_fund: formData.has_emergency_fund,
              emergency_fund_months: formData.emergency_fund_months,
              has_debt: formData.has_debt,
              debt_amount_vnd: formData.debt_amount_vnd,
              has_insurance: formData.has_insurance,
            }}
            step1={{
              monthly_expenses_vnd: formData.monthly_expenses_vnd,
            }}
            onChange={handleDataChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {currentStep === 3 && (
          <OnboardingStep3
            data={{
              risk_tolerance: formData.risk_tolerance,
              investment_knowledge: formData.investment_knowledge,
              career_field: formData.career_field,
              skills: formData.skills,
              financial_goals: formData.financial_goals,
            }}
            onChange={handleDataChange}
            onFinish={handleFinish}
            onPrev={handlePrev}
          />
        )}
      </div>

      {/* Security note */}
      <div className="flex justify-center text-[10px] text-zinc-600 gap-1.5 font-mono">
        <span>● {language === 'vi' ? 'Dữ liệu tự động mã hóa' : 'Data encrypted'}</span>
        <span>● {language === 'vi' ? 'Bảo mật cục bộ 100%' : '100% locally secure'}</span>
        <span>● {language === 'vi' ? 'Zero-Knowledge AI pipeline' : 'Zero-Knowledge AI Pipeline'}</span>
      </div>
    </div>
  );
}

export default Onboarding;
