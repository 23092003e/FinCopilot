/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { VNDInput } from '../components/shared/VNDInput';
import { useUI } from '../contexts/UIContext';
import { Transaction, Checkin } from '../lib/supabase/types';
import { 
  Receipt, Plus, Trash2, TrendingUp, TrendingDown, Sparkles, 
  Calendar, CreditCard, ChevronRight, CheckCircle2, AlertTriangle, Zap, ArrowRight, ArrowUpRight
} from 'lucide-react';

interface LedgerProps {
  profile: any;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  deleteTransaction: (id: string) => void;
  addCheckin: (checkin: Omit<Checkin, 'id' | 'created_at' | 'user_id'>, aiReview: string) => void;
  setActiveTab: (tab: string) => void;
}

export function Ledger({ 
  profile, 
  transactions, 
  addTransaction, 
  deleteTransaction, 
  addCheckin, 
  setActiveTab 
}: LedgerProps) {
  const { language, t } = useUI();
  
  // Transaction type filter
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'investment'>('all');
  
  // Telegram Webhook integration state
  const webhookToken = useMemo(() => {
    let token = localStorage.getItem('fincopilot_webhook_token');
    if (!token) {
      token = 'fc_tg_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
      localStorage.setItem('fincopilot_webhook_token', token);
    }
    return token;
  }, []);

  const [pendingTxs, setPendingTxs] = useState<any[]>([]);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [importing, setImporting] = useState(false);

  // Polling Telegram webhooks in the background
  React.useEffect(() => {
    let active = true;
    const fetchPending = async () => {
      try {
        const res = await fetch(`/api/webhook/pending?token=${webhookToken}`);
        if (res.ok && active) {
          const data = await res.json();
          // Safely set if different lengths or contains items
          if (data.transactions && (data.transactions.length > 0 || pendingTxs.length > 0)) {
            setPendingTxs(data.transactions);
          }
        }
      } catch (err) {
        console.warn('Silent error polling webhooks:', err);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [webhookToken, pendingTxs.length]);

  const handleAcceptAllPending = async () => {
    if (pendingTxs.length === 0) return;
    setImporting(true);
    try {
      pendingTxs.forEach((tx) => {
        addTransaction({
          type: tx.type,
          category: tx.category,
          amount_vnd: tx.amount_vnd,
          description: tx.description,
          date: tx.date,
        });
      });

      // Clear on server
      await fetch(`/api/webhook/clear?token=${webhookToken}`, { method: 'POST' });
      setPendingTxs([]);
      setSyncSuccess(language === 'vi' 
        ? `Đã ghi nhận thành công ${pendingTxs.length} giao dịch từ Telegram Bot!` 
        : `Successfully imported ${pendingTxs.length} transactions from Telegram Bot!`);
      setTimeout(() => setSyncSuccess(''), 4000);
    } catch (err) {
      console.error('Error importing webhook transactions:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleClearAllPending = async () => {
    try {
      await fetch(`/api/webhook/clear?token=${webhookToken}`, { method: 'POST' });
      setPendingTxs([]);
    } catch (err) {
      console.error('Error clearing webhook queue:', err);
    }
  };
  
  // Form State
  const [description, setDescription] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [category, setCategory] = useState('Ăn uống');
  const [amountStr, setAmountStr] = useState<number>(0);
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10)); // Today's date YYYY-MM-DD
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Auto categories based on transaction type
  const categoriesByType = useMemo(() => {
    return {
      income: ['Lương chính', 'Làm thêm', 'Đầu tư sinh lời', 'Khác'],
      expense: ['Ăn uống', 'Nhà cửa & Tiện ích', 'Đi lại', 'Học tập & Tri thức', 'Giải trí & Mua sắm', 'Y tế & Sức khỏe', 'Khác'],
      investment: ['Chứng chỉ quỹ ETF', 'Vàng & Tích sản', 'Tiết kiệm / Quỹ dự phòng', 'Khác']
    };
  }, []);

  // Update default category when type changes
  const handleTypeChange = (type: 'income' | 'expense' | 'investment') => {
    setTxType(type);
    setCategory(categoriesByType[type][0]);
    setFormError('');
  };

  // Compute stats for current month's transactions
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;

    transactions.forEach(tx => {
      // We sum all transactions (or can restrict to current month if needed, but overall ledger stats are best)
      if (tx.type === 'income') totalIncome += tx.amount_vnd;
      if (tx.type === 'expense') totalExpense += tx.amount_vnd;
      if (tx.type === 'investment') totalInvestment += tx.amount_vnd;
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const investmentRate = totalIncome > 0 ? (totalInvestment / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      totalInvestment,
      netSavings,
      savingsRate,
      investmentRate
    };
  }, [transactions]);

  // Specific current month stats for the Sync button
  const currentMonthStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;
    let currentMonthTxs: Transaction[] = [];

    transactions.forEach(tx => {
      if (tx.date.startsWith(currentMonthStr)) {
        currentMonthTxs.push(tx);
        if (tx.type === 'income') totalIncome += tx.amount_vnd;
        if (tx.type === 'expense') totalExpense += tx.amount_vnd;
        if (tx.type === 'investment') totalInvestment += tx.amount_vnd;
      }
    });

    return {
      totalIncome,
      totalExpense,
      totalInvestment,
      count: currentMonthTxs.length,
      txs: currentMonthTxs
    };
  }, [transactions, currentMonthStr]);

  // Grouped category representation for visuals
  const categoryBreakdown = useMemo(() => {
    const expensesGroup: Record<string, number> = {};
    let expenseTotal = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        expensesGroup[tx.category] = (expensesGroup[tx.category] || 0) + tx.amount_vnd;
        expenseTotal += tx.amount_vnd;
      }
    });

    return Object.entries(expensesGroup)
      .map(([cat, val]) => ({
        category: cat,
        amount: val,
        percentage: expenseTotal > 0 ? (val / expenseTotal) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // List of filtered transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType === 'all') return true;
      return tx.type === filterType;
    });
  }, [transactions, filterType]);

  // Form submit
  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError(language === 'vi' ? 'Vui lòng nhập mô tả hoặc nhãn giao dịch.' : 'Please enter a description or label.');
      return;
    }
    if (amountStr <= 0) {
      setFormError(language === 'vi' ? 'Vui lòng nhập số tiền hợp lý bằng ô VND.' : 'Please enter a valid amount.');
      return;
    }

    addTransaction({
      type: txType,
      category,
      amount_vnd: amountStr,
      description: description.trim(),
      date
    });

    // Reset status
    setDescription('');
    setAmountStr(0);
    setFormError('');
  };

  // Sync current month values and trigger AI check-in feedback automatically
  const handleSyncToCheckin = async () => {
    if (currentMonthStats.count === 0) return;
    setSyncLoading(true);
    setSyncSuccess('');

    // Pre-calculate notes with breakdown of highest spendings and income
    let generatedNotes = language === 'vi' 
      ? `Đồng bộ tự động từ Sổ Giao Dịch tháng ${currentMonthStr}.\nLịch sử giao dịch ghi nhận:\n`
      : `Auto-synchronized from Transaction Ledger for ${currentMonthStr}.\nTransactions breakdown logged:\n`;

    // Group current month by category
    const currentMonthGroup: Record<string, number> = {};
    currentMonthStats.txs.forEach(t => {
      currentMonthGroup[t.category] = (currentMonthGroup[t.category] || 0) + t.amount_vnd;
    });

    Object.entries(currentMonthGroup).forEach(([cat, amount]) => {
      generatedNotes += `• ${cat}: ${amount.toLocaleString('vi-VN')} ₫\n`;
    });

    try {
      // Call standard AI review API route
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem(`fincopilot_apikey_${profile.id}`) || '',
        },
        body: JSON.stringify({
          income: currentMonthStats.totalIncome,
          expenses: currentMonthStats.totalExpense,
          invested: currentMonthStats.totalInvestment,
          notes: generatedNotes,
        }),
      });

      let aiReviewText = '';

      if (res.ok) {
        const data = await res.json();
        aiReviewText = data.review;
      } else {
        // Local fallback evaluation heuristic mimicking server
        const savingsRate = currentMonthStats.totalIncome > 0 
          ? ((currentMonthStats.totalIncome - currentMonthStats.totalExpense) / currentMonthStats.totalIncome) * 100 
          : 0;
        const investRate = currentMonthStats.totalIncome > 0 
          ? (currentMonthStats.totalInvestment / currentMonthStats.totalIncome) * 100 
          : 0;

        if (savingsRate < 15) {
          aiReviewText = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN (NGOẠI TUYẾN)
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${savingsRate.toFixed(1)}% - **CẦN CẢI THIỆN ĐỎ**
*   **Tỷ số Tích sản (Investment Rate):** ${investRate.toFixed(1)}% - Cần thiết lập hạn mức ổn định.

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   Ghi nhận chi tiêu thực tế đang chiếm dụng phần lớn thu nhập tháng này. Sự rò rỉ chủ yếu đến từ các hóa đơn sinh hoạt tích lũy thầm lặng.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Hạn ngạch nghiêm ngặt:** Áp đặt hạn mức đối với ăn uống ngoài & vui chơi.
2.  **Đầu tư tự động:** Chuyển dịch đầu tư theo mốc đầu tháng ngay sau khi nhận lương.`;
        } else {
          aiReviewText = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN (NGOẠI TUYẾN)
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${savingsRate.toFixed(1)}% - **ỔN ĐỊNH VÀ AN TOÀN**
*   **Tỷ số Tích sản (Investment Rate):** ${investRate.toFixed(1)}% - Bạn đang quản lý kỷ luật tích sản tốt hằng quý!

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   Khung thặng dư tốt, biết giữ ngân sách mỏng chống bào mòn trước lạm phát vĩ mô Việt Nam.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **DCA đều kỷ luật:** Tiếp tục mua chứng chỉ quỹ khớp định kỳ mà không quan tâm giá biến động ngắn.
2.  **Trích quỹ tri thức:** Đầu tư 5% thặng dư bồi đắp kiến thức chuyên sâu để tăng thêm thu nhập gốc.`;
        }
      }

      // Add to checkins list
      addCheckin({
        month: currentMonthStr,
        income_actual_vnd: currentMonthStats.totalIncome,
        expenses_actual_vnd: currentMonthStats.totalExpense,
        invested_amount_vnd: currentMonthStats.totalInvestment,
        notes: generatedNotes,
        ai_review: aiReviewText
      }, aiReviewText);

      setSyncSuccess(language === 'vi' ? 'Đã phân tích và đồng bộ thành công sang Bảng Điều Khiển!' : 'Successfully synchronized and reviewed month in Dashboard!');
      
      // Delay navigation slightly to let user celebrate success
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'vi' ? 'Sổ Giao Dịch Cá Nhân' : 'Personal Transaction Ledger'}
        subtitle={language === 'vi' 
          ? 'Ghi ghi chép tỉ mỉ dòng tiền nhãn rỗi thu chi hằng ngày, tự động rà soát phân hoạch & chuyển giao vào báo cáo tài chính AI.' 
          : 'Track detail daily incomes, expenses, and investments with auto-synced AI financial reviewing.'}
        action={
          currentMonthStats.count > 0 && (
            <button
              onClick={handleSyncToCheckin}
              disabled={syncLoading}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>
                {syncLoading 
                  ? (language === 'vi' ? 'Đang phân tích...' : 'Syncing...') 
                  : (language === 'vi' ? `Đồng bộ Tháng ${currentMonthStr} → AI Review` : `Sync ${currentMonthStr} → AI Review`)}
              </span>
            </button>
          )
        }
      />

      {/* Sync toast notification success */}
      {syncSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Telegram Bot Webhook Queue Alerts */}
      {pendingTxs.length > 0 && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-4 h-4 animate-pulse text-emerald-400" />
              </div>
              <div>
                <h4 className="text-zinc-200 text-xs font-bold leading-none block font-semibold mb-1">
                  {language === 'vi' ? 'Phát hiện Giao dịch mới từ Telegram Bot!' : 'New Transactions feed from Telegram Bot detected!'}
                </h4>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {language === 'vi' 
                    ? `Phát hiện ${pendingTxs.length} giao dịch chờ duyệt. n8n đã gửi các chi tiêu này sang dưới dạng JSON.` 
                    : `Detected ${pendingTxs.length} pending transactions. n8n forwarded these details safely.`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto self-end">
              <button
                onClick={handleClearAllPending}
                className="flex-1 sm:flex-none py-1.5 px-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-905 hover:text-red-400 text-zinc-400 font-bold text-[10px] rounded-lg cursor-pointer transition-all focus:outline-none"
              >
                {language === 'vi' ? 'Bỏ qua tất cả' : 'Dismiss all'}
              </button>
              <button
                onClick={handleAcceptAllPending}
                disabled={importing}
                className="flex-1 sm:flex-none py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] rounded-lg cursor-pointer transition-all focus:outline-none flex justify-center items-center gap-1 shadow-sm"
              >
                <span>{language === 'vi' ? 'Duyệt & Ghi Sổ Tất Cả' : 'Approve & Import All'}</span>
                <ChevronRight className="w-3 h-3 text-zinc-950" />
              </button>
            </div>
          </div>
          
          {/* Quick list preview of pending transactions */}
          <div className="bg-zinc-950/60 rounded-xl border border-zinc-900 overflow-hidden text-[10px]">
            <div className="grid grid-cols-12 gap-2 p-2 font-mono text-zinc-500 border-b border-zinc-900 font-bold uppercase tracking-wider">
              <div className="col-span-4">{language === 'vi' ? 'Mô tả' : 'Description'}</div>
              <div className="col-span-3">{language === 'vi' ? 'Thể loại' : 'Type'}</div>
              <div className="col-span-3">{language === 'vi' ? 'Danh mục' : 'Category'}</div>
              <div className="col-span-2 text-right">{language === 'vi' ? 'Số tiền' : 'Amount'}</div>
            </div>
            <div className="divide-y divide-zinc-900/40 font-medium whitespace-nowrap">
              {pendingTxs.map((tx, idx) => (
                <div key={tx.id || idx} className="grid grid-cols-12 gap-2 p-2 hover:bg-zinc-900/20 text-zinc-300 font-mono items-center">
                  <div className="col-span-4 font-sans font-semibold text-zinc-200 truncate">{tx.description}</div>
                  <div className="col-span-3">
                    <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] capitalize ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                      tx.type === 'expense' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  <div className="col-span-3 truncate text-zinc-400">{tx.category}</div>
                  <div className="col-span-2 text-right text-zinc-100 font-extrabold">{tx.amount_vnd.toLocaleString('vi-VN')} ₫</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. KPI Stats Summary Bento Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5 hover:border-emerald-500/30 transition-all">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider block">
            {language === 'vi' ? 'Tổng Thu Nhập' : 'Total Income'}
          </span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-zinc-100 font-sans tracking-tight">
              {stats.totalIncome.toLocaleString('vi-VN')} ₫
            </span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 font-mono block">
            {language === 'vi' ? 'Dòng vốn gốc được tạo lập' : 'Generated primary flows'}
          </span>
        </div>

        {/* Expenses Card */}
        <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5 hover:border-red-500/30 transition-all">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider block">
            {language === 'vi' ? 'Tổng Chi Tiêu' : 'Total Expenses'}
          </span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-zinc-100 font-sans tracking-tight">
              {stats.totalExpense.toLocaleString('vi-VN')} ₫
            </span>
            <span className="p-1 rounded-lg bg-red-500/10 text-red-400">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[9px] text-zinc-650 text-zinc-500 font-mono block">
            {language === 'vi' ? `Tỷ lệ hấp thụ: ${stats.totalIncome > 0 ? ((stats.totalExpense / stats.totalIncome) * 100).toFixed(0) : 0}% thu nhập` : `Utilizing: ${stats.totalIncome > 0 ? ((stats.totalExpense / stats.totalIncome) * 100).toFixed(0) : 0}% of income`}
          </span>
        </div>

        {/* Investment Card */}
        <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5 hover:border-blue-500/30 transition-all">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider block">
            {language === 'vi' ? 'Tổng Tích Sản' : 'Total Investments'}
          </span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-extrabold text-zinc-100 font-sans tracking-tight">
              {stats.totalInvestment.toLocaleString('vi-VN')} ₫
            </span>
            <span className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono block">
            {language === 'vi' ? `Hiệu suất tích sản: ${stats.investmentRate.toFixed(1)}%` : `Investment rate: ${stats.investmentRate.toFixed(1)}%`}
          </span>
        </div>

        {/* Savings Rate Gauge */}
        <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5 hover:border-amber-500/30 transition-all">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider block">
            {language === 'vi' ? 'Tỉ Lệ Thặng Dư' : 'Net Savings Rate'}
          </span>
          <div className="flex justify-between items-baseline">
            <span className={`text-xl font-extrabold font-sans tracking-tight ${stats.savingsRate >= 30 ? 'text-emerald-400' : stats.savingsRate >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
              {stats.savingsRate.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-400">
              {stats.netSavings >= 0 ? '+' : ''}{(stats.netSavings / 1e6).toFixed(1)}M ₫
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full rounded-full transition-all duration-350 ${stats.savingsRate >= 30 ? 'bg-emerald-500' : stats.savingsRate >= 15 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Main split forms & transaction lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form column (Span 5): Transaction builder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-5.5 space-y-4">
            <h3 className="text-zinc-200 text-sm font-bold flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Plus className="w-4 h-4 text-emerald-400" />
              {language === 'vi' ? 'Ghi chép giao dịch mới' : 'Add New Transaction'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddTxSubmit} className="space-y-4.5">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
                  {language === 'vi' ? 'Phân Hệ Giao Dịch' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-900">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                      txType === 'income' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {language === 'vi' ? 'Thu Nhập' : 'Income'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                      txType === 'expense' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20 shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {language === 'vi' ? 'Chi Tiêu' : 'Expense'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('investment')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                      txType === 'investment' 
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {language === 'vi' ? 'Đầu Tư' : 'Invest'}
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
                  {language === 'vi' ? 'Số Tiền (VND)' : 'Amount (VND)'}
                </label>
                <VNDInput
                  value={amountStr}
                  onChange={(val) => {
                    setAmountStr(val);
                    setFormError('');
                  }}
                  placeholder={language === 'vi' ? 'Nhập số tiền giao dịch' : 'Enter transaction amount'}
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
                  {language === 'vi' ? 'Nội dung / Mô tả' : 'Description / Notes'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFormError('');
                  }}
                  placeholder={language === 'vi' ? 'Ví dụ: Đóng tiền nước nhà, Ăn phở sáng...' : 'e.g., Grocery shopping, Salary bonus...'}
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium text-xs transition-all placeholder-zinc-650"
                />
              </div>

              {/* Grid block for Category and Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
                    {language === 'vi' ? 'Danh mục' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-semibold transition-all"
                  >
                    {categoriesByType[txType].map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
                    {language === 'vi' ? 'Ngày phát sinh' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-bold font-mono transition-all"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex justify-center items-center gap-2 shadow focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-950" />
                <span>{language === 'vi' ? 'Ghi Sổ Giao Dịch' : 'Log Transaction'}</span>
              </button>

            </form>
          </div>

          {/* Spend Category breakdown helper (Bento detail) */}
          <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-5">
            <h4 className="text-zinc-200 text-xs font-extrabold flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3.5">
              <CreditCard className="w-3.5 h-3.5 text-red-400" />
              {language === 'vi' ? 'Rà soát Cơ cấu Chi tiêu' : 'Expenditure Breakdown'}
            </h4>
            {categoryBreakdown.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic p-3 text-center">
                {language === 'vi' ? 'Chưa ghi chép khoản chi tiêu nào để phân tích.' : 'No expense recorded for mapping.'}
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-350 font-semibold">{item.category}</span>
                      <span className="text-zinc-500 font-mono">
                        {item.amount.toLocaleString('vi-VN')} đ ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Elegant bar indicator */}
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Filterable Logs (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl p-5 space-y-4.5">
            
            {/* Header controls with tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <h3 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                {language === 'vi' ? 'Lịch sử giao dịch chi tiết' : 'Transaction Logs'}
              </h3>
              
              {/* Tabs buttons */}
              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-900 overflow-x-auto">
                {(['all', 'income', 'expense', 'investment'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`py-1 px-2 text-[10px] font-bold rounded-md transition-all whitespace-nowrap focus:outline-none cursor-pointer ${
                      filterType === type 
                        ? 'bg-zinc-900 text-emerald-400 border border-zinc-850' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {type === 'all' && (language === 'vi' ? 'Tất Cả' : 'All')}
                    {type === 'income' && (language === 'vi' ? 'Thu Nhập' : 'Incomes')}
                    {type === 'expense' && (language === 'vi' ? 'Chi Tiêu' : 'Expenses')}
                    {type === 'investment' && (language === 'vi' ? 'Đầu Tư' : 'Invests')}
                  </button>
                ))}
              </div>
            </div>

            {/* List entries */}
            {filteredTxs.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-zinc-500 text-xs font-semibold">
                  {language === 'vi' ? 'Không tìm thấy giao dịch nào tương xứng.' : 'No matched transactions found.'}
                </p>
                <p className="text-[11px] text-zinc-650">
                  {language === 'vi' ? 'Hãy ghi chép các thu chi đầu tiên của bạn ở bảng bên trái.' : 'Start recording items in the box on your left.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredTxs.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-900/40 bg-zinc-950/40 hover:bg-zinc-900/30 transition-all duration-200 group relative"
                  >
                    {/* Badge and Title */}
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg border ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' 
                          : tx.type === 'expense' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/15' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : tx.type === 'expense' ? <TrendingDown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-zinc-200 text-xs font-bold leading-none block">
                          {tx.description}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                          <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 font-semibold border border-zinc-850">
                            {tx.category}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-zinc-600" />
                            {tx.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value text & Bin icon */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-extrabold font-mono ${
                        tx.type === 'income' 
                          ? 'text-emerald-400' 
                          : tx.type === 'expense' 
                            ? 'text-red-400' 
                            : 'text-blue-400'
                      }`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '✦'} {tx.amount_vnd.toLocaleString('vi-VN')} đ
                      </span>

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-900 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-zinc-850"
                        title={language === 'vi' ? 'Xóa' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Micro-insight of ledger completeness */}
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-900 p-3.5 flex items-start gap-2.5">
              <Zap className="text-emerald-400 w-4.5 h-4.5 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-zinc-200 block uppercase tracking-wider">
                  {language === 'vi' ? '✦ ĐỒNG BỘ AI CO-PILOT HIỆU QUẢ' : '✦ AI CO-PILOT SYNC INSIGHT'}
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  {language === 'vi' 
                    ? `Bạn có ${currentMonthStats.count} giao dịch ghi nhận trong tháng này (${currentMonthStr}). Hãy nhấn nút "Đồng bộ Tháng ${currentMonthStr}" ở góc trên bên phải để chuyển trực tiếp sang Trợ lý ảo phân tích, đánh giá tỷ lệ tiết kiệm nâng cao và lưu kết quả vào Lịch sử Báo Cáo Tháng!`
                    : `You have logged ${currentMonthStats.count} transactions for ${currentMonthStr}. Use the "Sync ${currentMonthStr}" action at the top-right to dynamically evaluate with Copilot AI and submit to checkins history!`
                  }
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Collapsible Telegram Webhook config guide */}
      <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => setShowWebhookGuide(!showWebhookGuide)}
          className="w-full flex justify-between items-center p-5 text-left focus:outline-none cursor-pointer hover:bg-zinc-900/30 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <div className="space-y-0.5">
              <h4 className="text-zinc-200 text-xs font-extrabold uppercase tracking-wider">
                {language === 'vi' ? '🤖 Tích hợp Chatbot Telegram & n8n' : '🤖 Connect Telegram Bot & n8n'}
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium">
                {language === 'vi'
                  ? 'Bật tính năng nhập nhanh giao dịch thông qua AI tự động phân tích câu nói hàng ngày.'
                  : 'Enable quick transaction logging using AI which understands natural language text.'
                }
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono text-[10px] font-bold flex items-center gap-1">
            <span>{showWebhookGuide ? (language === 'vi' ? 'Ẩn hướng dẫn' : 'Hide Setup') : (language === 'vi' ? 'Xem cấu hình' : 'View Setup')}</span>
            <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${showWebhookGuide ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {showWebhookGuide && (
          <div className="p-5 border-t border-zinc-900 bg-zinc-950/30 space-y-5 text-xs text-zinc-400 font-medium leading-relaxed">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2 text-[11px]">
              <span className="font-extrabold text-emerald-400 uppercase tracking-widest block font-mono text-[10px]">
                {language === 'vi' ? '💡 Ý TƯỞNG CỦA BẠN RẤT TUYỆT VỜI!' : '💡 YOUR IDEA IS FANTASTIC!'}
              </span>
              <p>
                {language === 'vi'
                  ? 'Chúng tôi đã lập tức thiết lập Endpoint Webhook đồng bộ thực tế hoàn chỉnh cho bạn! Bản vẽ thiết kế kỹ thuật này cho thấy cách n8n lắng nghe tin nhắn từ Telegram Bot (ví dụ: "Ăn cơm trưa hết 50k", "Vừa nhận lương phụ 3.5m", "Mua chứng chỉ quỹ etf 10m"), chuyển sang AI xử lý, và POST kết quả JSON trực tiếp trở lại hệ thống này của bạn.'
                  : 'We have instantly built a fully functional synchronized receiver endpoint for you! When you send a simple text to your Telegram Bot (e.g. "lunch for 50k", "earned 2M side-income", "invested 10M in ETF"), n8n uses AI to analyze it and POSTs a JSON payload directly back here.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Step 1 */}
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4.5 space-y-2.5">
                <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md font-mono">
                  BƯỚC 1
                </span>
                <h5 className="font-extrabold text-zinc-200">
                  {language === 'vi' ? 'Tạo Telegram Bot' : 'Create Telegram Bot'}
                </h5>
                <ul className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-400 font-sans">
                  <li>{language === 'vi' ? 'Chat với @BotFather trên Telegram' : 'Go to Telegram and search @BotFather.'}</li>
                  <li>{language === 'vi' ? 'Gửi lệnh /newbot để tạo bot mới' : 'Send /newbot to create a bot.'}</li>
                  <li>{language === 'vi' ? 'Copy mã HTTP API Token nhận được' : 'Copy the generated HTTP API Token.'}</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4.5 space-y-2.5">
                <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md font-mono">
                  BƯỚC 2
                </span>
                <h5 className="font-extrabold text-zinc-200">
                  {language === 'vi' ? 'Thiết lập n8n Workflow' : 'Configure n8n Workflow'}
                </h5>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  {language === 'vi'
                    ? 'Tạo 1 Flow đơn giản trên n8n gồm 3 nodes:'
                    : 'Create a simple workflow on n8n comprised of 3 nodes:'}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-400 font-mono">
                  <li><span className="font-sans font-bold text-zinc-350">Telegram Trigger:</span> Listen message</li>
                  <li><span className="font-sans font-bold text-zinc-350">Gemini/OpenAI node:</span> JSON parser</li>
                  <li><span className="font-sans font-bold text-zinc-350">HTTP Request:</span> POST data web</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4.5 space-y-2.5">
                <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md font-mono">
                  BƯỚC 3
                </span>
                <h5 className="font-extrabold text-zinc-200">
                  {language === 'vi' ? 'Thông tin cấu hình HTTP' : 'HTTP Configuration Info'}
                </h5>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] block uppercase font-bold">{language === 'vi' ? 'PHƯƠNG THỨC' : 'METHOD'}</span>
                    <span className="py-0.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-extrabold font-mono text-[10px]">POST</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] block uppercase font-bold">WEBHOOK API URL</span>
                    <div className="flex gap-1 items-center bg-zinc-950 p-1.5 border border-zinc-850 rounded font-mono text-[9px] text-zinc-300 select-all overflow-x-auto truncate">
                      {window.location.origin}/api/webhook/transaction?token={webhookToken}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Code blueprint example block */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 space-y-3.5 pb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-900 pb-2">
                <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {language === 'vi' ? 'BẢN VẼ OUTPUT JSON CẦN THIẾT KẾ TRÊN AI (Cấu hình OpenAI/Gemini Node)' : 'REQUIRED AI OUTPUT JSON STRUCTURE (Configure AI node)'}
                </span>
                <button
                  onClick={() => {
                    const curlCmd = `curl -X POST "${window.location.origin}/api/webhook/transaction?token=${webhookToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "type": "expense",\n    "category": "Ăn uống",\n    "amount_vnd": 55000,\n    "description": "Ăn phở sáng",\n    "date": "${new Date().toISOString().substring(0, 10)}"\n  }'`;
                    navigator.clipboard.writeText(curlCmd);
                    alert(language === 'vi' ? 'Đã sao chép lệnh cURL mẫu để thử nghiệm!' : 'Copied sample cURL test command!');
                  }}
                  className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-850 hover:text-emerald-400 text-zinc-400 font-mono text-[9.5px] font-extrabold rounded border border-zinc-800 transition-colors cursor-pointer focus:outline-none"
                >
                  {language === 'vi' ? 'Sao chép Curl mẫu thử nghiệm' : 'Copy cURL Test Command'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[9.5px] text-zinc-500 font-mono font-bold block uppercase">{language === 'vi' ? 'Prompt yêu cầu cho AI (LLM node on n8n)' : 'System Prompt / AI Instruction'}</span>
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 text-[10.5px] whitespace-pre-wrap font-sans text-zinc-400 h-40 overflow-y-auto">
                    {language === 'vi'
                      ? `Hãy phân tích tin nhắn hội thoại ghi chép tài chính của người dùng và chuyển đổi thành định dạng JSON đơn lẻ.
Quy tắc:
1. Thể loại (type): chỉ được chọn 1 trong 3 giá trị ["income", "expense", "investment"].
   - Ví dụ: chi tiêu ăn uống, mua sắm, học hành -> "expense".
   - Ví dụ: nhận lương, làm thêm, thu hồi nợ -> "income".
   - Ví dụ: mua vàng, gửi tiết kiệm, DCA chỉ số, mua etf -> "investment".
2. Số tiền (amount_vnd): trích xuất đúng số tiền mặt VND, quy đổi viết tắt ra số nguyên. Ví dụ "50k" -> 50000, "1.5m" -> 1500000, "15 triệu" -> 15000000.
3. Danh mục (category): tự tìm nhóm phù hợp: "Ăn uống", "Học tập & Tri thức", "Y tế & Sức khỏe", "Chứng chỉ quỹ ETF", "Vàng & Tích sản", "Lương chính", "Làm thêm"...
4. Nội dung (description): mô tả ngắn gọn chi tiêu (Ví dụ: "Ăn phở sáng", "Chuyển tiền mua chứng chỉ quỹ").
5. Ngày (date): Ngày phát sinh dạng YYYY-MM-DD. Hãy lấy ngày hiện tại nếu không đề cập cụ thể.

Mẫu JSON phản hồi duy nhất:
{
  "type": "expense",
  "amount_vnd": 50000,
  "category": "Ăn uống",
  "description": "Ăn phở sáng",
  "date": "${new Date().toISOString().substring(0, 10)}"
}`
                      : `Analyze the user's micro-ledger transaction message and convert it to a clean single JSON object.
Rules:
1. "type": Must be one of ["income", "expense", "investment"].
2. "amount_vnd": Convert suffixes correctly to integers (e.g., "50k" -> 50000, "2M" -> 2000000).
3. "category": Pick an appropriate category name.
4. "description": Brief natural language description.
5. "date": In YYYY-MM-DD format (use current date if unspecified).

Target structure:
{
  "type": "expense",
  "amount_vnd": 50000,
  "category": "Ăn uống",
  "description": "Ăn phở sáng",
  "date": "${new Date().toISOString().substring(0, 10)}"
}`
                    }
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9.5px] text-zinc-500 font-mono font-bold block uppercase">{language === 'vi' ? 'Dữ liệu POST JSON mong đợi' : 'JSON Schema Target'}</span>
                  <pre className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 font-mono text-[10.5px] text-emerald-400 h-40 overflow-y-auto overflow-x-auto leading-relaxed">
                    {`{
  "type": "income" | "expense" | "investment",
  "amount_vnd": 50000,
  "category": "Ăn uống",
  "description": "Ăn phở sáng",
  "date": "2026-05-23"
}

// Hoặc gửi một lúc hàng loạt tin dưới dạng Array:
[
  { "type": "expense", "amount_vnd": 30000, ... },
  { "type": "investment", "amount_vnd": 1000000, ... }
]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Ledger;
