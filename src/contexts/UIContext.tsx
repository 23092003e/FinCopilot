/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';

interface UIContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used inside UIProvider');
  return context;
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  vi: {
    // Nav Items
    'nav.dashboard': 'Bảng Điều Khiển',
    'nav.advisor': 'Co-Pilot Phân Bổ',
    'nav.onboarding': 'Thiết Lập Hồ Sơ',
    'nav.simulator': 'Mô Phỏng DCA',
    'nav.scenarios': 'So Sánh Tài Sản',
    'nav.sidehustle': 'Mở Rộng Thu Nhập',
    'nav.settings': 'Cài Đặt',
    'nav.logout': 'Đăng xuất tài khoản',
    'nav.developed_by': 'Phát triển bởi bệ đỡ AI',
    'nav.vnyouth': 'Dành riêng cho giới trẻ Việt',

    // Quick Stats
    'stat.actual_savings': 'Tích lũy thực tế:',
    'stat.fund_status': 'Trạng thái quỹ phòng vệ:',
    'stat.stable': 'Ổn định',
    'stat.low_risk': 'Rủi ro thấp',
    'stat.new_member': 'Hội viên mới',
    'stat.professional': 'Chuyên nghiệp',
    'stat.software_engineer': 'Kỹ sư phần mềm',
    'stat.aiml_engineer': 'Kỹ sư AI/ML',

    // Settings General
    'setting.title': 'Cấu hình tài chính cá nhân',
    'setting.subtitle': 'Tùy chỉnh thông số thu nhập, thời gian rảnh và mức độ chấp nhận rủi ro để AI mô phỏng chính xác.',
    'setting.fullname': 'Họ và tên của bạn',
    'setting.career': 'Lĩnh vực sự nghiệp',
    'setting.career.tech': 'Công nghệ & Kỹ thuật',
    'setting.career.marketing': 'Marketing & Sáng tạo',
    'setting.career.finance': 'Tài chính & Đầu tư',
    'setting.career.other': 'Ngành nghề khác',
    'setting.risk': 'Mức độ khẩu vị rủi ro',
    'setting.risk.conservative': 'Thận trọng (Bảo toàn vốn)',
    'setting.risk.moderate': 'Trung bình (Cân bằng tích sản)',
    'setting.risk.aggressive': 'Mạnh mẽ (Tối đa tăng trưởng)',
    'setting.knowledge': 'Kiến thức đầu tư',
    'setting.knowledge.low': 'Mới bắt đầu (Chưa có kinh nghiệm)',
    'setting.knowledge.medium': 'Cơ bản (Đã mua chứng chỉ quỹ, vàng...)',
    'setting.knowledge.high': 'Nâng cao (Tự giao dịch cổ phiếu, quỹ mở...)',
    'setting.save': 'Lưu cấu hình',
    'setting.saved': 'Đã cập nhật cấu hình mới!',
    'setting.reset': 'Xóa sạch dữ liệu',
    'setting.reset_desc': 'Hành động này sẽ xóa toàn bộ lịch sử check-in, cấu trúc tài sản và thông tin thiết lập cục bộ của tài khoản này.',

    // Settings API Key
    'api.title': 'Cấu hình Trí tuệ Nhân tạo (Gemini AI Key)',
    'api.description': 'FinCopilot sử dụng mô hình trí tuệ nhân tạo thế hệ mới Gemini 3.5 Flash để tính toán cấu trúc tài sản và rà soát báo cáo tháng của riêng bạn. Theo mặc định, ứng dụng vận hành dựa trên khóa máy chủ dùng chung (Shared Key). Nếu muốn tốc độ tối ưu hoặc bypass giới hạn lưu lượng, bạn hãy nhập API Key riêng của mình dưới đây.',
    'api.key_label': 'Khóa API cá nhân (Gemini API Key)',
    'api.shared_key': 'Đang sử dụng khóa máy chủ dùng chung',
    'api.private_key': 'Đang kích hoạt khóa cá nhân',
    'api.placeholder': 'Nhập API Key của bạn (ví dụ: AIzaSy...)',
    'api.save': 'Lưu khóa',
    'api.saved_status': 'Đã lưu!',
    'api.disclaimer': '* Khóa API được mã hóa và lưu trữ an toàn trong vùng nhớ cục bộ trình duyệt (localStorage), không bao giờ lưu trữ công khai hay lưu truyền bừa bãi.',

    // Common Phrases
    'btn.save': 'Lưu thay đổi',
    'btn.saving': 'Đang xử lý...',
    'btn.next': 'Tiếp tục',
    'btn.prev': 'Quay lại',
    'btn.finish': 'Hoàn tất thiết lập',
    'loading.generic': 'Hệ thống đang tải dữ liệu...',

    // Screen specific titles and descriptions
    'dashboard.title': 'Bảng Điều Khiển Tài Chính',
    'dashboard.desc': 'Ứng dụng AI phân tích dòng tiền nhàn rỗi tích sản thông minh ứng dụng Trí Tuệ Nhân Tạo.',
    'advisor.title': 'Co-Pilot Phân Bổ Tài Sản',
    'advisor.desc': 'AI tính toán tỷ lệ dòng tiền nhàn rỗi phân phối tối ưu vào các kênh tài sản dựa trên chỉ số rủi ro.',
    'simulator.title': 'Mô Phỏng DCA',
    'simulator.desc': 'Lập kế hoạch đầu tư tích sản định kỳ và mô phỏng kết quả dài hạn.',
    'scenarios.title': 'So Sánh Tài Sản',
    'scenarios.desc': 'Mô phỏng phân chia vốn vào các loại tài sản kịch bản rủi ro khác nhau.',
    'sidehustle.title': 'Mở Rộng Thu Nhập',
    'sidehustle.desc': ' AI đề xuất công việc phụ (Side Hustle) tạo dòng tiền tăng vốn tích lũy tăng trưởng nhanh.',
  },
  en: {
    // Nav Items
    'nav.dashboard': 'Dashboard',
    'nav.advisor': 'Asset Co-Pilot',
    'nav.onboarding': 'Profile Onboarding',
    'nav.simulator': 'DCA Simulator',
    'nav.scenarios': 'Asset Scenario Comparison',
    'nav.sidehustle': 'Expand Income',
    'nav.settings': 'Settings',
    'nav.logout': 'Sign Out Account',
    'nav.developed_by': 'Empowered by AI Engineering',
    'nav.vnyouth': 'Designed for Vietnamese Youth',

    // Quick Stats
    'stat.actual_savings': 'Actual Savings:',
    'stat.fund_status': 'Emergency Fund:',
    'stat.stable': 'Stable',
    'stat.low_risk': 'Low Reserves',
    'stat.new_member': 'New Member',
    'stat.professional': 'Professional',
    'stat.software_engineer': 'Software Engineer',
    'stat.aiml_engineer': 'AI/ML Engineer',

    // Settings General
    'setting.title': 'Personal Finance Settings',
    'setting.subtitle': 'Customize income factors, spare hours, and risk appetite parameters for precision AI simulation.',
    'setting.fullname': 'Your Full Name',
    'setting.career': 'Career Industry',
    'setting.career.tech': 'Technology & Engineering',
    'setting.career.marketing': 'Marketing & Creative',
    'setting.career.finance': 'Finance & Investment',
    'setting.career.other': 'Other Industries',
    'setting.risk': 'Investment Risk Tolerance',
    'setting.risk.conservative': 'Conservative (Capital Preservation)',
    'setting.risk.moderate': 'Moderate (Balanced Accumulation)',
    'setting.risk.aggressive': 'Aggressive (Maximizing Growth)',
    'setting.knowledge': 'Investment Knowledge Level',
    'setting.knowledge.low': 'Beginner (No experience yet)',
    'setting.knowledge.medium': 'Intermediate (Bought funds, gold...)',
    'setting.knowledge.high': 'Advanced (Self-trading stocks, open funds...)',
    'setting.save': 'Save Configuration',
    'setting.saved': 'Configuration updated successfully!',
    'setting.reset': 'Reset All Local Data',
    'setting.reset_desc': 'This action permanently removes all historic check-ins, custom allocation models, and configurations for this account.',

    // Settings API Key
    'api.title': 'AI Engine Configuration (Gemini API Key)',
    'api.description': 'FinCopilot harnesses the next-generation Gemini 3.5 Flash artificial intelligence model to calculate optimized asset models and audit monthly review logs. By default, it operates on a shared cluster key. If you seek maximum speeds or want to bypass request quotas, add your private Gemini API Key below.',
    'api.key_label': 'Private Gemini API Key',
    'api.shared_key': 'Active shared cluster key',
    'api.private_key': 'Active private key',
    'api.placeholder': 'Enter your API key (e.g. AIzaSy...)',
    'api.save': 'Save Key',
    'api.saved_status': 'Saved!',
    'api.disclaimer': '* The API key is securely encrypted and stored locally in browser storage (localStorage) and is never transmitted to shared index servers.',

    // Common Phrases
    'btn.save': 'Save Changes',
    'btn.saving': 'Processing...',
    'btn.next': 'Continue',
    'btn.prev': 'Back',
    'btn.finish': 'Complete Setup',
    'loading.generic': 'System loading resources...',

    // Screen specific titles and descriptions
    'dashboard.title': 'Financial Control Dashboard',
    'dashboard.desc': 'Smart idle cash allocation dashboard powered by Advanced generative AI and portfolio optimization models.',
    'advisor.title': 'Asset Allocation Co-Pilot',
    'advisor.desc': 'AI aggregates your financial metrics to split monthly spare cash across specialized asset classes.',
    'simulator.title': 'DCA Accumulation Simulator',
    'simulator.desc': 'Map out periodic investment savings rate to projects compound interest wealth yields in the long term.',
    'scenarios.title': 'Asset Scenario Modeler',
    'scenarios.desc': 'Simulate active distributions allocations under high, balanced, and low stress scenarios.',
    'sidehustle.title': 'Side Hustle Generator',
    'sidehustle.desc': 'Generative AI reviews your key skills to design side-income strategies to boost investment speed.',
  }
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('fincopilot_theme') as Theme) || 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fincopilot_language') as Language) || 'vi';
  });

  // Apply theme to document documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('fincopilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fincopilot_language', lang);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language];
    return langDict[key] || key;
  };

  return (
    <UIContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
      {children}
    </UIContext.Provider>
  );
};
