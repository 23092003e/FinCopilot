/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { NetWorthChart } from '../components/charts/NetWorthChart';
import { AllocationPieChart } from '../components/charts/AllocationPieChart';
import { EmergencyFundAlert } from '../components/shared/EmergencyFundAlert';
import { formatVND } from '../lib/utils/vnd';
import { emergencyFundStatus } from '../lib/utils/finance';
import { AllocationResponse, Checkin, Profile } from '../lib/supabase/types';
import { Calendar, Wallet, TrendingUp, HandCoins, HelpCircle, Loader2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface DashboardProps {
  profile: Profile;
  allocation: AllocationResponse | null;
  checkins: Checkin[];
  addCheckin: (checkin: Omit<Checkin, 'id' | 'created_at' | 'user_id'>, aiReview: string) => void;
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ profile, allocation, checkins, addCheckin, setActiveTab }: DashboardProps) {
  const { language, t } = useUI();
  // New check-in form state
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [invested, setInvested] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorReview, setErrorReview] = useState('');

  // Emergency status helper
  const fundStatus = emergencyFundStatus({
    currentFund: profile.has_emergency_fund ? (profile.emergency_fund_months * (profile.monthly_expenses_vnd || 10000000)) : 0,
    monthlyExpenses: profile.monthly_expenses_vnd,
  });

  const handleAddCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorReview('');

    const parsedIncome = parseFloat(income);
    const parsedExpenses = parseFloat(expenses);
    const parsedInvested = parseFloat(invested);

    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setErrorReview(language === 'vi' ? 'Vui lòng nhập thu nhập thực tế hợp lệ.' : 'Please enter a valid actual income.');
      return;
    }
    if (isNaN(parsedExpenses) || parsedExpenses <= 0) {
      setErrorReview(language === 'vi' ? 'Vui lòng nhập chi tiêu thực tế hợp lệ.' : 'Please enter valid actual expenses.');
      return;
    }
    if (isNaN(parsedInvested) || parsedInvested < 0) {
      setErrorReview(language === 'vi' ? 'Vui lòng nhập số tiền đầu tư thực tế.' : 'Please enter a valid actual invested amount.');
      return;
    }

    setLoadingReview(true);

    try {
      // Call Gemini for review feedback
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem(`fincopilot_apikey_${profile.id}`) || '',
        },
        body: JSON.stringify({
          income: parsedIncome,
          expenses: parsedExpenses,
          invested: parsedInvested,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error(language === 'vi' ? 'Không thể lấy đánh giá từ AI. Sử dụng đánh giá cục bộ.' : 'Could not fetch AI review. Using local evaluation.');
      }

      const data = await res.json();
      
      // Save check-in
      addCheckin(
        {
          month: new Date().toISOString().substring(0, 7), // YYYY-MM
          income_actual_vnd: parsedIncome,
          expenses_actual_vnd: parsedExpenses,
          invested_amount_vnd: parsedInvested,
          notes,
          ai_review: data.review,
        },
        data.review
      );

      // Reset fields
      setIncome('');
      setExpenses('');
      setInvested('');
      setNotes('');
    } catch (err: any) {
      console.error(err);
      setErrorReview(language === 'vi' ? 'Gặp sự cố kết nối tới Co-pilot. Vui lòng kiểm tra lại cấu hình.' : 'Co-pilot connection issues. Please check your configuration.');
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'vi' ? `Chào ${profile.full_name || 'Khách'},` : `Hello ${profile.full_name || 'Guest'},`}
        subtitle={language === 'vi' ? 'Chào mừng bạn quay lại hệ sinh thái quản lý dòng tiền của FinCopilot. Dưới đây là rà soát tài chính hiện tại của bạn.' : 'Welcome back to your FinCopilot cashflow command center. Here is your current financial analysis.'}
        action={
          <button
            onClick={() => setActiveTab('advisor')}
            className="py-1.5 px-4 bg-emerald-500 text-zinc-950 font-semibold rounded-md text-xs hover:bg-emerald-400 transition-colors shadow focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            {language === 'vi' ? 'Nhận Tư Vấn Cấu Trúc AI' : 'Get AI Allocation Advice'}
          </button>
        }
      />

      {/* 1. NetWorth KPI Bento Card Block */}
      <NetWorthChart
        savings={profile.total_savings_vnd}
        income={profile.monthly_income_vnd}
        expenses={profile.monthly_expenses_vnd}
        debt={profile.debt_amount_vnd}
        emergencyFundMonths={profile.emergency_fund_months}
      />

      {/* 2. Emergency Alert Prerequisite Block */}
      <EmergencyFundAlert months={profile.emergency_fund_months} />

      {/* 3. Main Split Structure: Pie Allocation vs Check-ins list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Portfolio distribution */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 px-2.5 py-1">
            <h3 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {language === 'vi' ? 'Sơ đồ Phân bổ danh mục Khuyên dùng' : 'Recommended Portfolio Allocation'}
            </h3>
            <span className="text-[10px] text-zinc-500">
              {language === 'vi' ? 'Mức rủi ro: ' : 'Risk Appetite: '}
              {allocation?.risk_level === 'high' ? (language === 'vi' ? 'Mạo hiểm' : 'Aggressive') : allocation?.risk_level === 'low' ? (language === 'vi' ? 'Thận trọng' : 'Conservative') : (language === 'vi' ? 'Hợp lý' : 'Moderate')}
            </span>
          </div>

          {allocation ? (
            <AllocationPieChart data={allocation} />
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center space-y-3">
              <p className="text-zinc-400 text-sm">
                {language === 'vi' ? 'Bạn chưa kiến tạo danh mục phân bổ tài sản thông minh.' : 'You have not initialized a smart asset allocation portfolio yet.'}
              </p>
              <button
                onClick={() => setActiveTab('advisor')}
                className="py-1.5 px-4 bg-emerald-500 text-zinc-950 rounded font-semibold text-xs hover:bg-emerald-400 transition-colors"
              >
                {language === 'vi' ? 'Tạo Ngay Danh Mục' : 'Generate Portfolio Now'}
              </button>
            </div>
          )}
        </div>

        {/* Right column: Dynamic Checkins and Checkin Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* New Monthly Checkin Form Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
            <h4 className="text-zinc-100 font-bold text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              {language === 'vi' ? 'Báo cáo Tài chính Tháng này' : "This Month's Financial Report"}
            </h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              {language === 'vi' ? 'Khai báo số thực chi tiêu tháng này giúp AI phản hồi, bám sát rò rỉ và đề xuất điều chỉnh cơ cấu phân bổ.' : 'Report actual cash factors so your AI Co-pilot can audit spending leaks and adjust allocation balances.'}
            </p>

            <form onSubmit={handleAddCheckinSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="chk_inc" className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                    {language === 'vi' ? 'Thu nhập thực tế (VND)' : 'Actual Income (VND)'}
                  </label>
                  <input
                    id="chk_inc"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="35000000"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="chk_exp" className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                    {language === 'vi' ? 'Chi tiêu thực tế (VND)' : 'Actual Expenses (VND)'}
                  </label>
                  <input
                    id="chk_exp"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="14500000"
                    className="w-full bg-zinc-950 border border-zinc-805 text-zinc-100 font-mono text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="chk_invest" className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                  {language === 'vi' ? 'Số tiền đã đầu tư thực tế (VND)' : 'Actual Invested Sum (VND)'}
                </label>
                <input
                  id="chk_invest"
                  type="number"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                  placeholder="12000000"
                  className="w-full bg-zinc-950 border border-zinc-805 text-zinc-100 font-mono text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="chk_notes" className="block text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                  {language === 'vi' ? 'Ghi chú của bạn' : 'Your Personal Notes'}
                </label>
                <textarea
                  id="chk_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'vi' ? 'Ví dụ: Lương tháng này về muộn, hoặc phát sinh sửa xe tay ga...' : 'e.g. Delayed salary dispatch, or unexpected vehicle service bills...'}
                  className="w-full bg-zinc-950 border border-zinc-805 text-zinc-100 text-xs rounded p-2 h-16 resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorReview && (
                <p className="text-xs text-red-400 font-medium">{errorReview}</p>
              )}

              <button
                type="submit"
                disabled={loadingReview}
                className="w-full py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loadingReview ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'vi' ? 'Hệ thống đang đánh giá...' : 'AI review indexing...'}</span>
                  </>
                ) : (
                  <>
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Lưu báo cáo & Hỏi ý kiến AI' : 'Save & Consult Co-pilot'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historical Checkins List widget */}
          <div className="space-y-3">
            <h4 className="text-zinc-300 font-bold text-xs px-1">
              {language === 'vi' ? `Lịch sử đánh giá tài chính (${checkins.length})` : `Financial Review Log (${checkins.length})`}
            </h4>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
              {checkins.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center italic py-4">
                  {language === 'vi' ? 'Chưa có lịch sử báo cáo dòng tiền tháng.' : 'No monthly check-in history reported yet.'}
                </p>
              ) : (
                checkins.map((item) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold text-zinc-200">
                          {language === 'vi' ? 'Báo cáo tháng: ' : 'Report: '}{item.month}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ROI: {item.income_actual_vnd > 0 ? (((item.income_actual_vnd - item.expenses_actual_vnd) / item.income_actual_vnd) * 100).toFixed(0) : 0}% {language === 'vi' ? 'Dư rảnh' : 'Savings Rate'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-900/50 p-2 rounded">
                      <div className="text-zinc-400">
                        {language === 'vi' ? 'Thu nhập: ' : 'Income: '}<span className="text-zinc-200 font-semibold">{formatVND(item.income_actual_vnd, true)}</span>
                      </div>
                      <div className="text-zinc-400">
                        {language === 'vi' ? 'Chi tiêu: ' : 'Expenses: '}<span className="text-zinc-200 font-semibold">{formatVND(item.expenses_actual_vnd, true)}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic bg-zinc-900/30 px-1 border-l-2 border-zinc-800">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="border-t border-zinc-900 pt-2.5 space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold font-mono block">
                        {language === 'vi' ? 'Nhận xét Co-pilot:' : 'Co-pilot Evaluation feedback:'}
                      </span>
                      <div className="text-[11px] text-zinc-300 leading-relaxed space-y-1 pl-1 whitespace-pre-wrap">
                        {item.ai_review}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
