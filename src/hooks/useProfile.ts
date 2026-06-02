/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Profile, AllocationResponse, SideHustleIdea, Checkin, Transaction, AssetHoldingLog } from '../types';

// Standard preset holdings for early-career professionals
const getPresetAssetHoldings = (userId: string = 'local_user_id'): AssetHoldingLog[] => {
  const yearMonth = new Date().toISOString().substring(0, 7);
  return [
    {
      id: 'ahl1',
      user_id: userId,
      asset_type: 'ETF',
      symbol: 'E1VFVN30',
      price_vnd: 22100,
      quantity: 200,
      date: `${yearMonth}-03`,
      notes: 'Gom chứng chỉ quỹ ETF VN30 khớp lệnh tự động',
      created_at: new Date().toISOString()
    },
    {
      id: 'ahl2',
      user_id: userId,
      asset_type: 'ETF',
      symbol: 'E1VFVN30',
      price_vnd: 22800,
      quantity: 300,
      date: `${yearMonth}-12`,
      notes: 'Thêm khi giá điều chỉnh nhẹ, tiếp tục dồn tiền',
      created_at: new Date().toISOString()
    },
    {
      id: 'ahl3',
      user_id: userId,
      asset_type: 'GOLD',
      symbol: 'GOLD_TA_9999',
      price_vnd: 8200000,
      quantity: 2,
      date: `${yearMonth}-02`,
      notes: 'Tích sản 2 chỉ vàng nhẫn an sinh xã hội',
      created_at: new Date().toISOString()
    }
  ];
};

// Standard high-quality presets for Vietnamese early-career professionals (e.g. tech engineer, age 27, saving 150M)
const PRESET_PROFILE: Profile = {
  id: 'local_user_id',
  full_name: 'Nguyễn Minh Anh',
  career_field: 'software',
  monthly_income_vnd: 35000000, // 35 Million VND
  monthly_expenses_vnd: 15000000, // 15 Million VND
  total_savings_vnd: 200000000, // 200 Million VND
  has_emergency_fund: true,
  emergency_fund_months: 4.5, // 200M / 15M = ~ 4.5 ratio
  has_debt: true,
  debt_amount_vnd: 25000000, // 25 Million VND student/laptop/credit debt
  has_insurance: true,
  risk_tolerance: 'moderate',
  investment_knowledge: 'intermediate',
  skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
  financial_goals: ['house_2years', 'early_retire', 'side_business'],
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial preset allocation matching PRESET_PROFILE
const PRESET_ALLOCATION: AllocationResponse = {
  allocation: {
    emergency_fund: {
      pct: 20,
      amount_vnd: 40000000,
      reasoning: 'Quy đổi 40,000,000 ₫ (gần bằng 2.7 tháng chi tiêu thiết yếu) để duy trì quỹ khẩn cấp linh hoạt cao gửi iSave/Finhay.',
    },
    etf_dca: {
      pct: 40,
      amount_vnd: 80000000,
      reasoning: 'Giải ngân 80,000,000 ₫ mua chứng chỉ quỹ ETF VN30 (E1VFVN30) hoặc quỹ S&P500 qua các CTCK uy tín như TCB Securities (TCBS) để sinh lời dài hạn.',
    },
    self_investment: {
      pct: 15,
      amount_vnd: 30000000,
      reasoning: '30,000,000 ₫ đầu tư thích đáng cho các chứng chỉ lập trình nâng cao, kỹ năng thuyết trình, tiếng Anh hoặc sách vở định hướng chuyên sâu.',
    },
    business_capital: {
      pct: 15,
      amount_vnd: 30000000,
      reasoning: 'Tích lũy 30,000,000 ₫ làm vốn ban đầu phục vụ các ý tưởng Freelance hoặc làm SaaS nhỏ tạo thu nhập phụ.',
    },
    cash_reserve: {
      pct: 10,
      amount_vnd: 20000000,
      reasoning: 'Duy trì 20,000,000 ₫ tiền mặt thanh khoản cực cao trong tài khoản chính để chuẩn bị cho các cơ hội đầu tư hấp dẫn khi thị trường xảy ra nhịp điều chỉnh sâu.',
    },
  },
  overall_reasoning: 'Hồ sơ của Minh Anh có mức độ chịu rủi ro Trung bình, thu nhập vững vàng ở lĩnh vực công nghệ. Tỷ lệ tiết kiệm đạt ~57% là một con số rất tốt. Chiến lược khuyên dùng là DCA chủ động vào rổ VN30 kết hợp phát triển năng lực chuyên môn để thúc đẩy tiền lương gốc tăng vọt.',
  risk_level: 'moderate',
  warnings: [
    'Khoản nợ 25.000.000 ₫ cần được theo dõi kỹ. Nếu lãi suất vay tín chấp lớn hơn 8%/năm, hãy cân nhắc trích tiền mặt xử lý triệt để ngay lập tức.',
  ],
  opportunity_cost: 'Nếu duy trì toàn bộ 200,000,000 ₫ ở tài khoản tiết kiệm thông thường (3.5% p.a), bạn có thể mất đi tiềm năng tăng trưởng ròng khoảng 12,000,000 ₫ mỗi năm so với chiến bổ sản phẩm DCA hỗn hợp.',
};

// Initial preset check-ins
const PRESET_CHECKINS: Checkin[] = [
  {
    id: 'c1',
    user_id: 'local_user_id',
    month: '2026-03',
    income_actual_vnd: 34000000,
    expenses_actual_vnd: 16000000,
    invested_amount_vnd: 12000000,
    notes: 'Tháng này có ăn đám cưới đồng nghiệp, chi tiêu đi lại hơi lố ngân sách nhưng vẫn duy trì DCA đều đặn.',
    ai_review: '* **Kỷ luật tốt**: Tuy chi tiêu vọt nhẹ do cưới hỏi, bạn vẫn kiên định phân bổ 12.000.000 ₫ tích lũy rổ cổ phiếu VN30. Đây là thói quen vàng tự động.\n* **Rò rỉ dòng tiền phụ**: Khoản tiêu vượt mức nhẹ có thể bù đắp qua tuần sau bằng cách nấu ăn tại nhà nhiều hơn.\n* **Tổng kết**: Tiếp tục duy trì đà tăng trưởng này nhé Minh Anh!',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    user_id: 'local_user_id',
    month: '2026-04',
    income_actual_vnd: 38000000,
    expenses_actual_vnd: 14500000,
    invested_amount_vnd: 16000000,
    notes: 'Làm thêm OT được thưởng nóng, cắt bớt 1.5 triệu mua sắm để ném hết vào quỹ tích lũy.',
    ai_review: '* **Hiệu suất tuyệt vời**: Tỷ lệ tiết kiệm thực tế vọt lên trên 60% nhờ phần thưởng OT. Đây là cách bứt phá tài sản nhanh nhất của người trẻ.\n* **Đầu tư thông minh**: Giải ngân thêm 4.000.000 ₫ so với tháng trước giúp đẩy nhanh tiến trình sở hữu chứng chỉ VN30 giá tốt.\n* **Đề xuất**: Hãy tự thưởng một phần quà nhỏ để duy trì động lực, phần dôi dư giữ đúng kỷ luật phân bổ.',
    created_at: new Date().toISOString(),
  }
];

// Initial preset transactions for the current month
const getPresetTransactions = (userId: string = 'local_user_id'): Transaction[] => {
  const currentYearMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-05"
  return [
    {
      id: 'tx1',
      user_id: userId,
      type: 'income',
      category: 'Lương chính',
      amount_vnd: 35000000,
      description: 'Nhận lương tháng thực nhận sau thuế',
      date: `${currentYearMonth}-05`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx2',
      user_id: userId,
      type: 'income',
      category: 'Làm thêm',
      amount_vnd: 4500000,
      description: 'Thanh toán freelance viết Landing Page',
      date: `${currentYearMonth}-12`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx3',
      user_id: userId,
      type: 'expense',
      category: 'Nhà cửa & Tiện ích',
      amount_vnd: 5500000,
      description: 'Tiền thuê căn hộ và điện nước dịch vụ',
      date: `${currentYearMonth}-10`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx4',
      user_id: userId,
      type: 'expense',
      category: 'Ăn uống',
      amount_vnd: 2800000,
      description: 'Đóng tiền ăn uống gia đình & siêu thị tuần',
      date: `${currentYearMonth}-15`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx5',
      user_id: userId,
      type: 'expense',
      category: 'Giải trí & Mua sắm',
      amount_vnd: 1200000,
      description: 'Café & ăn uống liên hoan cuối tuần bè bạn',
      date: `${currentYearMonth}-18`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx6',
      user_id: userId,
      type: 'investment',
      category: 'Chứng chỉ quỹ ETF',
      amount_vnd: 12000000,
      description: 'DCA mua Chứng chỉ quỹ ETF VN30 (E1VFVN30)',
      date: `${currentYearMonth}-06`,
      created_at: new Date().toISOString()
    },
    {
      id: 'tx7',
      user_id: userId,
      type: 'investment',
      category: 'Tiết kiệm / Quỹ dự phòng',
      amount_vnd: 3000000,
      description: 'Tích lũy quỹ dự phòng an sinh xã hội',
      date: `${currentYearMonth}-07`,
      created_at: new Date().toISOString()
    }
  ];
};

export function useProfile(userId?: string) {
  const [profile, setProfileState] = useState<Profile>(() => {
    const key = userId ? `fincopilot_${userId}_profile` : 'fincopilot_profile';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : PRESET_PROFILE;
  });

  const [allocation, setAllocationState] = useState<AllocationResponse | null>(() => {
    const key = userId ? `fincopilot_${userId}_allocation` : 'fincopilot_allocation';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : (userId ? null : PRESET_ALLOCATION);
  });

  const [sideHustles, setSideHustlesState] = useState<SideHustleIdea[]>(() => {
    const key = userId ? `fincopilot_${userId}_side_hustles` : 'fincopilot_side_hustles';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [checkins, setCheckinsState] = useState<Checkin[]>(() => {
    const key = userId ? `fincopilot_${userId}_checkins` : 'fincopilot_checkins';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : (userId ? [] : PRESET_CHECKINS);
  });

  const [dcaSimulation, setDcaSimulationState] = useState<any>(() => {
    const key = userId ? `fincopilot_${userId}_dca_simulation` : 'fincopilot_dca_simulation';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactionsState] = useState<Transaction[]>(() => {
    const key = userId ? `fincopilot_${userId}_transactions` : 'fincopilot_transactions';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : getPresetTransactions(userId);
  });

  const [assetHoldings, setAssetHoldingsState] = useState<AssetHoldingLog[]>(() => {
    const key = userId ? `fincopilot_${userId}_asset_holdings` : 'fincopilot_asset_holdings';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : getPresetAssetHoldings(userId);
  });

  // Track switching of users and reload their storage instantly
  useEffect(() => {
    const key_profile = userId ? `fincopilot_${userId}_profile` : 'fincopilot_profile';
    const key_allocation = userId ? `fincopilot_${userId}_allocation` : 'fincopilot_allocation';
    const key_hustles = userId ? `fincopilot_${userId}_side_hustles` : 'fincopilot_side_hustles';
    const key_checkins = userId ? `fincopilot_${userId}_checkins` : 'fincopilot_checkins';
    const key_dca = userId ? `fincopilot_${userId}_dca_simulation` : 'fincopilot_dca_simulation';
    const key_tx = userId ? `fincopilot_${userId}_transactions` : 'fincopilot_transactions';
    const key_assets = userId ? `fincopilot_${userId}_asset_holdings` : 'fincopilot_asset_holdings';

    const p = localStorage.getItem(key_profile);
    const a = localStorage.getItem(key_allocation);
    const h = localStorage.getItem(key_hustles);
    const c = localStorage.getItem(key_checkins);
    const d = localStorage.getItem(key_dca);
    const tx = localStorage.getItem(key_tx);
    const ah = localStorage.getItem(key_assets);

    if (p) {
      setProfileState(JSON.parse(p));
    } else {
      if (userId) {
        // Create blank/onboarding profile for new custom users
        const newProfile: Profile = {
          id: userId,
          full_name: '',
          career_field: null,
          monthly_income_vnd: 0,
          monthly_expenses_vnd: 0,
          total_savings_vnd: 0,
          has_emergency_fund: false,
          emergency_fund_months: 0,
          has_debt: false,
          debt_amount_vnd: 0,
          has_insurance: false,
          risk_tolerance: null,
          investment_knowledge: null,
          skills: [],
          financial_goals: [],
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfileState(newProfile);
        localStorage.setItem(key_profile, JSON.stringify(newProfile));
      } else {
        setProfileState(PRESET_PROFILE);
      }
    }

    setAllocationState(a ? JSON.parse(a) : (userId ? null : PRESET_ALLOCATION));
    setSideHustlesState(h ? JSON.parse(h) : []);
    setCheckinsState(c ? JSON.parse(c) : (userId ? [] : PRESET_CHECKINS));
    setDcaSimulationState(d ? JSON.parse(d) : null);
    setTransactionsState(tx ? JSON.parse(tx) : getPresetTransactions(userId));
    setAssetHoldingsState(ah ? JSON.parse(ah) : getPresetAssetHoldings(userId));
  }, [userId]);

  // Sync state changes with localStorage
  const updateProfile = (updated: Partial<Profile>) => {
    setProfileState((prev) => {
      const p = { ...prev, ...updated, updated_at: new Date().toISOString() };
      const key = userId ? `fincopilot_${userId}_profile` : 'fincopilot_profile';
      localStorage.setItem(key, JSON.stringify(p));
      return p;
    });
  };

  const updateAllocation = (newAlloc: AllocationResponse) => {
    setAllocationState(newAlloc);
    const key = userId ? `fincopilot_${userId}_allocation` : 'fincopilot_allocation';
    localStorage.setItem(key, JSON.stringify(newAlloc));
  };

  const updateSideHustles = (ideas: SideHustleIdea[]) => {
    setSideHustlesState(ideas);
    const key = userId ? `fincopilot_${userId}_side_hustles` : 'fincopilot_side_hustles';
    localStorage.setItem(key, JSON.stringify(ideas));
  };

  const saveDCASimulation = (simResult: any) => {
    setDcaSimulationState(simResult);
    const key = userId ? `fincopilot_${userId}_dca_simulation` : 'fincopilot_dca_simulation';
    localStorage.setItem(key, JSON.stringify(simResult));
  };

  const addCheckin = (checkin: Omit<Checkin, 'id' | 'created_at' | 'user_id'>, aiReview: string) => {
    const newCheckin: Checkin = {
      ...checkin,
      id: 'checkin_' + Date.now(),
      user_id: profile.id,
      ai_review: aiReview,
      created_at: new Date().toISOString(),
    };
    setCheckinsState((prev) => {
      const newList = [newCheckin, ...prev]; // Latest first
      const key = userId ? `fincopilot_${userId}_checkins` : 'fincopilot_checkins';
      localStorage.setItem(key, JSON.stringify(newList));
      return newList;
    });
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId || 'local_user_id',
      created_at: new Date().toISOString()
    };
    setTransactionsState((prev) => {
      const newList = [newTx, ...prev];
      const key = userId ? `fincopilot_${userId}_transactions` : 'fincopilot_transactions';
      localStorage.setItem(key, JSON.stringify(newList));
      return newList;
    });
  };

  const deleteTransaction = (txId: string) => {
    setTransactionsState((prev) => {
      const newList = prev.filter(t => t.id !== txId);
      const key = userId ? `fincopilot_${userId}_transactions` : 'fincopilot_transactions';
      localStorage.setItem(key, JSON.stringify(newList));
      return newList;
    });
  };

  const addAssetHolding = (holding: Omit<AssetHoldingLog, 'id' | 'user_id' | 'created_at'>) => {
    const newHolding: AssetHoldingLog = {
      ...holding,
      id: 'ahl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId || 'local_user_id',
      created_at: new Date().toISOString()
    };
    setAssetHoldingsState((prev) => {
      const newList = [newHolding, ...prev];
      const key = userId ? `fincopilot_${userId}_asset_holdings` : 'fincopilot_asset_holdings';
      localStorage.setItem(key, JSON.stringify(newList));
      return newList;
    });
  };

  const deleteAssetHolding = (holdingId: string) => {
    setAssetHoldingsState((prev) => {
      const newList = prev.filter(h => h.id !== holdingId);
      const key = userId ? `fincopilot_${userId}_asset_holdings` : 'fincopilot_asset_holdings';
      localStorage.setItem(key, JSON.stringify(newList));
      return newList;
    });
  };

  const resetAllData = (wipeBlank: boolean = true) => {
    const pref = userId ? `fincopilot_${userId}_` : 'fincopilot_';
    
    if (wipeBlank) {
      const blankProfile: Profile = {
        id: userId || 'local_user_id',
        full_name: '',
        career_field: null,
        monthly_income_vnd: 0,
        monthly_expenses_vnd: 0,
        total_savings_vnd: 0,
        has_emergency_fund: false,
        emergency_fund_months: 0,
        has_debt: false,
        debt_amount_vnd: 0,
        has_insurance: false,
        risk_tolerance: null,
        investment_knowledge: null,
        skills: [],
        financial_goals: [],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set explicit empty/clean states in localStorage to bypass default fallbacks
      localStorage.setItem(`${pref}profile`, JSON.stringify(blankProfile));
      localStorage.setItem(`${pref}allocation`, JSON.stringify(null));
      localStorage.setItem(`${pref}side_hustles`, JSON.stringify([]));
      localStorage.setItem(`${pref}checkins`, JSON.stringify([]));
      localStorage.setItem(`${pref}transactions`, JSON.stringify([]));
      localStorage.setItem(`${pref}asset_holdings`, JSON.stringify([]));
      localStorage.removeItem(`${pref}dca_simulation`);

      setProfileState(blankProfile);
      setAllocationState(null);
      setSideHustlesState([]);
      setCheckinsState([]);
      setDcaSimulationState(null);
      setTransactionsState([]);
      setAssetHoldingsState([]);
    } else {
      // Clear specific user settings to fall back to clean demo presets
      localStorage.removeItem(`${pref}profile`);
      localStorage.removeItem(`${pref}allocation`);
      localStorage.removeItem(`${pref}side_hustles`);
      localStorage.removeItem(`${pref}checkins`);
      localStorage.removeItem(`${pref}transactions`);
      localStorage.removeItem(`${pref}asset_holdings`);
      localStorage.removeItem(`${pref}dca_simulation`);

      if (userId) {
        setProfileState({
          id: userId,
          full_name: 'Nguyễn Minh Anh',
          career_field: 'software',
          monthly_income_vnd: 35000000,
          monthly_expenses_vnd: 15000000,
          total_savings_vnd: 200000000,
          has_emergency_fund: true,
          emergency_fund_months: 4.5,
          has_debt: true,
          debt_amount_vnd: 25000000,
          has_insurance: true,
          risk_tolerance: 'moderate',
          investment_knowledge: 'intermediate',
          skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
          financial_goals: ['house_2years', 'early_retire', 'side_business'],
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setAllocationState(PRESET_ALLOCATION);
        setSideHustlesState([]);
        setCheckinsState(PRESET_CHECKINS);
        setDcaSimulationState(null);
        setTransactionsState(getPresetTransactions(userId));
        setAssetHoldingsState(getPresetAssetHoldings(userId));
      } else {
        setProfileState(PRESET_PROFILE);
        setAllocationState(PRESET_ALLOCATION);
        setSideHustlesState([]);
        setCheckinsState(PRESET_CHECKINS);
        setDcaSimulationState(null);
        setTransactionsState(getPresetTransactions());
        setAssetHoldingsState(getPresetAssetHoldings());
      }
    }
  };

  return {
    profile,
    allocation,
    sideHustles,
    checkins,
    dcaSimulation,
    transactions,
    assetHoldings,
    updateProfile,
    updateAllocation,
    updateSideHustles,
    saveDCASimulation,
    addCheckin,
    addTransaction,
    deleteTransaction,
    addAssetHolding,
    deleteAssetHolding,
    resetAllData,
  };
}
export default useProfile;
