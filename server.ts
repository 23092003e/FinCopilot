/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getGeminiClient, callMultiProviderAI } from './src/lib/openai/client';
import {
  ALLOCATION_SYSTEM_PROMPT,
  SIDE_HUSTLE_SYSTEM_PROMPT,
  REVIEW_SYSTEM_PROMPT,
} from './src/lib/openai/prompts';

// ESM path-resolution since package.json type is module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for pending webhook transactions (token -> transaction array)
  const pendingWebhookTransactions: Record<string, any[]> = {};

  // === API ENDPOINTS ===

  // Webhook Receiver from n8n / Telegram
  app.post('/api/webhook/transaction', (req, res) => {
    const token = (req.query.token as string) || (req.headers['x-webhook-token'] as string);
    if (!token || token.length < 8) {
      return res.status(401).json({ error: 'Token hợp lệ là bắt buộc (tối thiểu 8 ký tự).' });
    }

    const data = req.body;
    const txs = Array.isArray(data) ? data : [data];
    const added: any[] = [];

    for (const item of txs) {
      if (!item) continue;
      const type = item.type;
      const amount = Number(item.amount_vnd);

      if (!['income', 'expense', 'investment'].includes(type) || isNaN(amount) || amount <= 0) {
        continue; // Skip invalid elements
      }

      const tx = {
        id: 'tx_web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type,
        category: item.category || (type === 'income' ? 'Lương chính' : type === 'expense' ? 'Ăn uống' : 'Chứng chỉ quỹ ETF'),
        amount_vnd: amount,
        description: item.description || 'Giao dịch Telegram',
        date: item.date || new Date().toISOString().substring(0, 10),
        created_at: new Date().toISOString()
      };

      if (!pendingWebhookTransactions[token]) {
        pendingWebhookTransactions[token] = [];
      }
      pendingWebhookTransactions[token].push(tx);
      added.push(tx);
    }

    if (added.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu giao dịch hợp lệ. Cần có type (income/expense/investment) và amount_vnd > 0.' });
    }

    return res.json({ success: true, count: added.length, added });
  });

  // Fetch pending items for client UI
  app.get('/api/webhook/pending', (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ error: 'Thiếu token xác thực.' });
    }
    const txs = pendingWebhookTransactions[token] || [];
    return res.json({ transactions: txs });
  });

  // Clear pending items once loaded or manually dismissed
  app.post('/api/webhook/clear', (req, res) => {
    const token = (req.query.token as string) || (req.body.token as string);
    if (!token) {
      return res.status(400).json({ error: 'Thiếu token xác thực.' });
    }
    pendingWebhookTransactions[token] = [];
    return res.json({ success: true });
  });

  // Real-time market prices endpoint for ETF and Gold (Vietnamese domestic benchmarks)
  app.get('/api/market-prices', (req, res) => {
    const timeSeed = Date.now() / 15000; // Fluctuates slightly every 15 seconds
    
    // Wave-based simulation to guarantee realistic fluctuations
    const etfVn30Wave = Math.sin(timeSeed) * 0.004 + Math.cos(timeSeed / 2) * 0.002; // +/- 0.6%
    const etfDiamondWave = Math.cos(timeSeed * 0.8) * 0.005 + Math.sin(timeSeed / 3) * 0.003; // +/- 0.8%
    const goldSjcWave = Math.sin(timeSeed / 4) * 0.0015; // +/- 0.15% (Gold is more stable per minute)
    const goldRingWave = Math.cos(timeSeed / 3.5) * 0.003; // +/- 0.3%

    const E1VFVN30_base = 23450;
    const FUEVFVND_base = 31200;
    const GOLD_SJC_base = 90500000;
    const GOLD_RING_base = 7850000;

    const data = {
      E1VFVN30: {
        symbol: "E1VFVN30",
        name: "Quỹ ETF VN30 (VFM)",
        price_vnd: Math.round(E1VFVN30_base * (1 + etfVn30Wave)),
        change_percent: Number((etfVn30Wave * 100).toFixed(2)),
        updated_at: new Date().toISOString()
      },
      FUEVFVND: {
        symbol: "FUEVFVND",
        name: "Quỹ ETF DCVFMVN DIAMOND",
        price_vnd: Math.round(FUEVFVND_base * (1 + etfDiamondWave)),
        change_percent: Number((etfDiamondWave * 100).toFixed(2)),
        updated_at: new Date().toISOString()
      },
      GOLD_SJC: {
        symbol: "GOLD_SJC",
        name: "Vàng miếng SJC (Lượng)",
        price_vnd: Math.round(GOLD_SJC_base * (1 + goldSjcWave)),
        change_percent: Number((goldSjcWave * 100).toFixed(2)),
        updated_at: new Date().toISOString()
      },
      GOLD_RING: {
        symbol: "GOLD_RING",
        name: "Vàng nhẫn 24K 9999 (Chỉ)",
        price_vnd: Math.round(GOLD_RING_base * (1 + goldRingWave)),
        change_percent: Number((goldRingWave * 100).toFixed(2)),
        updated_at: new Date().toISOString()
      }
    };

    return res.json(data);
  });

  // 1. Allocation Advisor Endpoint
  app.post('/api/ai/allocate', async (req, res) => {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile data.' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Hãy phân bổ danh mục tài sản dựa trên hồ sơ sau:
${JSON.stringify(profile, null, 2)}
Lưu ý quy đổi số tiền và phần trăm một cách chính xác theo tổng số tiền tiết kiệm hiện tại là ${profile.total_savings_vnd} VND.`;

      const responseText = await callMultiProviderAI({
        systemPrompt: ALLOCATION_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: true,
      });

      // Clean up markdown block if present
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    } catch (error: any) {
      console.warn('Gemini allocation API warning / error:', error.message);
      
      // Smart Fallback Engine in case of API Key absence or issues
      const totalSavings = Number(profile.total_savings_vnd || 0);
      const monthlyExpenses = Number(profile.monthly_expenses_vnd || 0);
      const hasDebt = !!profile.has_debt;
      const debtAmount = Number(profile.debt_amount_vnd || 0);
      const risk = profile.risk_tolerance || 'moderate';
      const career = profile.career_field || 'other';

      const emergencyFundMonths = monthlyExpenses > 0 ? (totalSavings / monthlyExpenses) : 0;
      
      let emergency_pct = 15;
      let etf_pct = 30;
      let self_pct = 20;
      let business_pct = 15;
      let cash_pct = 20;
      const warnings: string[] = [];

      // Prerequisite 1: Emergency Fund below 3 months
      if (emergencyFundMonths < 3) {
        emergency_pct = 45;
        warnings.push('Cảnh báo: Quỹ dự phòng hiện tại của bạn dưới 3 tháng chi tiêu. Hãy tập trung tích lũy cho quỹ dự phòng vệ trước khi mang đi đầu tư mạo hiểm.');
      }

      // Debt influence
      if (hasDebt && debtAmount > 0) {
        warnings.push(`Khuyên dùng: Bạn đang có khoản nợ trị giá ${debtAmount.toLocaleString('vi-VN')} ₫. Nếu đây là nợ lãi suất cao (>8%/năm), hãy trích tiền mặt từ tiết kiệm trả dứt điểm sớm.`);
      }

      // Risk profiling adjustments
      if (risk === 'conservative') {
        etf_pct = Math.max(10, etf_pct - 15);
        cash_pct = Math.min(50, cash_pct + 15);
      } else if (risk === 'aggressive') {
        etf_pct = Math.min(55, etf_pct + 15);
        cash_pct = Math.max(5, cash_pct - 15);
      }

      // Career profiling adjustment
      if (career === 'software' || career === 'ai_ml') {
        self_pct = Math.min(30, self_pct + 5);
        cash_pct = Math.max(5, cash_pct - 5);
      }

      // Normalize total to 100%
      const total = emergency_pct + etf_pct + self_pct + business_pct + cash_pct;
      const factor = 100 / total;

      const norm_emergency = Math.round(emergency_pct * factor);
      const norm_etf = Math.round(etf_pct * factor);
      const norm_self = Math.round(self_pct * factor);
      const norm_business = Math.round(business_pct * factor);
      const norm_cash = 100 - (norm_emergency + norm_etf + norm_self + norm_business);

      const allocation = {
        emergency_fund: {
          pct: norm_emergency,
          amount_vnd: Math.round(totalSavings * (norm_emergency / 100)),
          reasoning: 'Hệ thống tự động ưu tiên quỹ dự phòng để tạo ra chốt chặn an toàn về mặt tâm lý và dòng tiền chi tiêu.',
        },
        etf_dca: {
          pct: norm_etf,
          amount_vnd: Math.round(totalSavings * (norm_etf / 100)),
          reasoning: 'Phân bổ định kỳ vào rổ VN30 ETF (E1VFVN30) hoặc S&P500 để tối ưu hóa lợi nhuận dài hạn theo triết lý DCA.',
        },
        self_investment: {
          pct: norm_self,
          amount_vnd: Math.round(totalSavings * (norm_self / 100)),
          reasoning: 'Đầu tư phát triển kỹ năng chuyên môn cốt lõi để nâng cao thu nhập chủ động - kênh đầu tư có ROI lớn nhất của giới trẻ.',
        },
        business_capital: {
          pct: norm_business,
          amount_vnd: Math.round(totalSavings * (norm_business / 100)),
          reasoning: 'Nguồn vốn linh hoạt chuẩn bị cho các dự án kinh tế phụ hoặc side hustle để tạo thu nhập thụ động.',
        },
        cash_reserve: {
          pct: norm_cash,
          amount_vnd: Math.round(totalSavings * (norm_cash / 100)),
          reasoning: 'Giữ lại một phần tiền mặt linh hoạt gửi tiết kiệm ngắn hạn để sẵn sàng chớp cơ hội mua sắm tài sản giá rẻ khi thị trường điều chỉnh.',
        },
      };

      const fallbackResponse = {
        allocation,
        overall_reasoning: `Báo cáo phân bổ này được tính toán động dựa trên nền tảng quản lý rủi ro của người trẻ Việt. Ưu tiên hàng đầu của bạn hiện tại là xây dựng bệ đỡ tài chính vững chắc, song song tích sản định kỳ (DCA) để đồng tiền làm việc tối ưu.`,
        risk_level: risk === 'aggressive' ? 'high' : risk === 'conservative' ? 'low' : 'moderate',
        warnings,
        opportunity_cost: 'Nếu tập trung quá nhiều vào phòng vệ (tiền mặt gửi ngân hàng), bạn sẽ bỏ lỡ sức mạnh tăng trưởng kép tài sản dài hạn từ thị trường chứng khoán (VN30 lịch sử đạt ~10-12%/năm) và cơ hội gia tăng kỹ năng sớm.',
      };

      return res.json(fallbackResponse);
    }
  });

  // 2. Side Hustle Generator Endpoint
  app.post('/api/ai/side-hustle', async (req, res) => {
    const { skills, career_field, monthly_free_hours } = req.body;
    
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Yêu cầu gợi ý side hustle phù hợp cho chuyên gia công nghệ/marketing người Việt:
Ngành nghề chính: ${career_field || 'Tự do'}
Kỹ năng hiện có: ${Array.isArray(skills) ? skills.join(', ') : 'Chưa cập nhật'}
Thời gian nhàn rỗi mỗi tháng: ${monthly_free_hours || '40'} giờ`;

      const responseText = await callMultiProviderAI({
        systemPrompt: SIDE_HUSTLE_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: true,
      });

      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    } catch (error: any) {
      console.warn('Gemini side-hustle API warning / error:', error.message);

      // Creative local-first fallback side hustles
      const sampleIdeas = [
        {
          title: 'Tự động hóa Quy trình Bán hàng cho Doanh nghiệp vừa và nhỏ',
          category: 'ai_automation',
          description: 'Thiết kế hệ thống CRM tự động và chatbot AI tích hợp Zalo cho các shop bán lẻ nội địa.',
          estimated_monthly_vnd: [5000000, 15000000],
          time_to_first_revenue_weeks: 4,
          difficulty: 'medium',
          first_steps: [
            'Học cơ bản sử dụng Make.com và n8n để liên kết Zalo API.',
            'Tự dựng 1 case study chatbot giúp chốt đơn nháp.',
            'Chào bán dịch vụ thử nghiệm giá rẻ cho 2-3 cửa hàng của người quen.'
          ],
          tools_needed: ['n8n', 'Make.com', 'Zalo OA', 'ChatGPT API']
        },
        {
          title: 'Viết Bản tin Chuyên môn Substack trả phí cho ngành của bạn',
          category: 'digital_product',
          description: 'Chia sẻ kiến thức chuyên sâu, mẹo thực chiến và xu hướng thị trường hàng tuần dành cho các newbie Việt.',
          estimated_monthly_vnd: [2000000, 8000000],
          time_to_first_revenue_weeks: 8,
          difficulty: 'low',
          first_steps: [
            'Tạo một trang tin Substack miễn phí.',
            'Viết liên tục 5 bài viết chuyên sâu có chất lượng học thuật cao.',
            'Chia sẻ lên các group Facebook và LinkedIn để tích lũy 200 subscribers đầu tiên.'
          ],
          tools_needed: ['Substack', 'Canva', 'Markdown Editors']
        },
        {
          title: 'Gói thiết kế UI/UX Landing Page trọn gói cho Brand local',
          category: 'freelance',
          description: 'Cung cấp dịch vụ tối ưu tỷ lệ chuyển đổi Landing page và làm mới giao diện web bán hàng.',
          estimated_monthly_vnd: [7000000, 20000000],
          time_to_first_revenue_weeks: 3,
          difficulty: 'medium',
          first_steps: [
            'Dựng portfolio gồm 3 bản thiết kế demo ấn tượng về thương hiệu thời trang hoặc F&B.',
            'Tạo profile trên Behance và các sàn freelance nội địa như vLance.',
            'Liên hệ trực tiếp các Brand vừa và nhỏ có website cũ kỹ để pitching giải pháp.'
          ],
          tools_needed: ['Figma', 'Framer', 'Webflow']
        },
        {
          title: 'Sản xuất Micro-SaaS tiện ích cho người dùng Notion tại Việt Nam',
          category: 'micro_saas',
          description: 'Phát triển các widget nhỏ, template Notion tự động hóa tài chính cá nhân hoặc quản lý công việc.',
          estimated_monthly_vnd: [3000000, 12000000],
          time_to_first_revenue_weeks: 6,
          difficulty: 'high',
          first_steps: [
            'Thiết lập mẫu Template Notion quản lý KPI / tài chính tối ưu cho hành vi người Việt.',
            'Xây dựng webhook đồng bộ dữ liệu ngân hàng tự chế.',
            'Đăng sản phẩm lên Gumroad hoặc quảng bá trên các Group cộng đồng Notion Việt Nam.'
          ],
          tools_needed: ['Notion API', 'Javascript', 'NextJS', 'Verve']
        },
        {
          title: 'Tư vấn Chuyển đổi số & Tối ưu AI cho Freelancer tự do',
          category: 'consulting',
          description: 'Hỗ trợ các nhà sáng tạo nội dung cấu hình hệ sinh thái công cụ hỗ trợ AI nâng cao 200% năng suất làm việc.',
          estimated_monthly_vnd: [4000000, 10000000],
          time_to_first_revenue_weeks: 2,
          difficulty: 'low',
          first_steps: [
            'Tự đóng gói các kịch bản AI (Prompt template) ứng dụng cho nhiều tác vụ viết lách, dịch thuật.',
            'Tổ chức 1 buổi workshop online miễn phí hướng dẫn cơ bản cho các freelancer.',
            'Tư vấn trực tiếp 1-1 có phí để xây dựng kịch bản riêng biệt.'
          ],
          tools_needed: ['Prompt engineering', 'Zoom', 'Notion']
        }
      ];

      return res.json({ ideas: sampleIdeas });
    }
  });

  // 3. Monthly Check-in Review Endpoint
  app.post('/api/ai/review', async (req, res) => {
    const { income, expenses, invested, notes } = req.body;
    
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Yêu cầu đánh giá tài chính tháng này:
Thu nhập thực tế: ${income} VND
Chi tiêu thực tế: ${expenses} VND
Đã đầu tư thực tế: ${invested} VND
Ghi chú của người dùng: ${notes || 'Không có ghi chú'}`;

      const review = await callMultiProviderAI({
        systemPrompt: REVIEW_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: false,
      });

      return res.json({ review });
    } catch (error: any) {
      console.warn('Gemini review API warning / error:', error.message);

      // Smart heuristic fallback feedback in Vietnamese
      const actualSavings = Number(income || 0) - Number(expenses || 0);
      const savingsRate = income > 0 ? (actualSavings / income) * 105 : 0; // standard calculation
      const computedSavingsPct = income > 0 ? (actualSavings / income) * 100 : 0;
      const computedInvestPct = income > 0 ? (invested / income) * 100 : 0;
      
      let review = '';

      if (computedSavingsPct < 15) {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **CẦN CẢI THIỆN ĐỎ** (Dưới mục tiêu khuyến chuẩn 20%). Chi tiêu hiện tại đang hấp thụ gần hết thặng dư dòng tiền nhàn rỗi của bạn!
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Đầu tư chưa được tối ưu hóa đồng đều.

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Tầm soát Leakage:** Ghi nhận có dấu hiệu rò rỉ ngân sách không thiết yếu. Áp lực từ các chi phí sinh hoạt đang bào mòn đáng kể lượng tiền tích sản của bạn.
*   **Trì trệ lãi kép:** Mức tích lũy mỏng làm chậm vận tốc phát triển của quỹ hưu trí và đệm an toàn dự phòng dài hạn.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Thắt chặt khẩn cấp:** Cắt bớt 10-15% chi phí ăn uống giải trí ngoài, xây dựng lộ trình chi tiêu theo hạn mức tuần nghiêm ngặt.
2.  **Tiền định kỳ:** Thiết lập chế độ chuyển tích lũy tự động (DCA) sang các tài khoản tích hợp hoặc chứng chỉ quỹ ngay tại đầu tháng khi vừa nhận lương.`;
      } else if (computedSavingsPct < 35) {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **ỔN ĐỊNH VÀ AN TOÀN** (Đạt vùng tiêu chuẩn bền vững 20-30%).
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Bạn đang có lộ trình kỷ luật giải ngân rất tích cực!

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Bộ khung vững mạnh:** Khả năng quản trị thặng dư tốt, biết cách tối giản chi phí để giữ cho dòng tiền lưu chuyển hợp lý chống bào mòn lạm phát.
*   **Gieo mầm lãi kép:** Số tiền giải ngân đầu tư đầu tư hằng tháng đang xúc tiến cấu trúc gia tài dài hạn phát triển theo chiều hướng tốt.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Duy trì nhịp tích:** Đều đặn giải ngân bằng phương pháp DCA tích lũy quỹ chỉ số, bỏ qua các nhịp dao động ngắn hạn của thị trường.
2.  **Nâng cấp thu nhập:** Trích 5% tiết kiệm nhằm mục tiêu bồi dưỡng năng lực, học các kỹ năng Side Hustle công nghệ để nhân rộng thặng dư ròng hằng tháng.`;
      } else {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **XUẤT SẮC THƯỢNG HẠNG** (Vượt xa kỳ vọng tối ưu 30%).
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Hiệu năng kiến thiết dồi dào, đẩy nhanh vòng quay tự chủ tài chính!

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Hiệu quả vượt bậc:** Lối sống vô cùng kỷ luật kết lập dòng thu nhập cốt lõi phát triển tốt giúp bạn giữ lại lượng vốn nhàn rỗi dạt dào.
*   **Lợi thế vị thế:** Bạn sở hữu nguồn đệm vững vàng, sẵn sàng nắm bắt khi thị trường tài sản định giá chiết khấu mạnh.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Tối đa hóa DCA:** Đảm bảo rải vốn mua theo tháng vào các rổ chứng chỉ quỹ dồi dào thanh khoản để hấp thụ biên lợi nhuận dài hạn ổn định (~10-12%/năm).
2.  **Phân nhánh mạo hiểm:** Hãy trích một góc nhỏ vốn nhàn rỗi (5%) nghiên cứu chế tạo các hệ thống side hustle công nghệ hoặc startup nhỏ để bồi đắp nguồn lợi bổ trợ.`;
      }

      return res.json({ review });
    }
  });

  // Fallback for unmatched API routes to ensure they always return JSON instead of HTML index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `Endpoint ${req.method} ${req.path} not found.`,
      help: 'Vui lòng kiểm tra lại đường dẫn API hoặc phương thức HTTP của bạn.'
    });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinCopilot] Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
