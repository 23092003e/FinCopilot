/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getGeminiClient } from './src/lib/openai/client';
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

  // === API ENDPOINTS ===

  // 1. Allocation Advisor Endpoint
  app.post('/api/ai/allocate', async (req, res) => {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile data.' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const ai = getGeminiClient(customApiKey);
      const prompt = `Hãy phân bổ danh mục tài sản dựa trên hồ sơ sau:
${JSON.stringify(profile, null, 2)}
Lưu ý quy đổi số tiền và phần trăm một cách chính xác theo tổng số tiền tiết kiệm hiện tại là ${profile.total_savings_vnd} VND.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: ALLOCATION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1, // low temperature for consistent JSON
        },
      });

      const responseText = response.text || '';
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
      const ai = getGeminiClient(customApiKey);
      const prompt = `Yêu cầu gợi ý side hustle phù hợp cho chuyên gia công nghệ/marketing người Việt:
Ngành nghề chính: ${career_field || 'Tự do'}
Kỹ năng hiện có: ${Array.isArray(skills) ? skills.join(', ') : 'Chưa cập nhật'}
Thời gian nhàn rỗi mỗi tháng: ${monthly_free_hours || '40'} giờ`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SIDE_HUSTLE_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
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
      const ai = getGeminiClient(customApiKey);
      const prompt = `Yêu cầu đánh giá tài chính tháng này:
Thu nhập thực tế: ${income} VND
Chi tiêu thực tế: ${expenses} VND
Đã đầu tư thực tế: ${invested} VND
Ghi chú của người dùng: ${notes || 'Không có ghi chú'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: REVIEW_SYSTEM_PROMPT,
          temperature: 0.6,
        },
      });

      return res.json({ review: response.text });
    } catch (error: any) {
      console.warn('Gemini review API warning / error:', error.message);

      // Smart heuristic fallback feedback in Vietnamese
      const actualSavings = Number(income || 0) - Number(expenses || 0);
      const savingsRate = income > 0 ? (actualSavings / income) * 100 : 0;
      let review = '';

      if (savingsRate < 10) {
        review = `* **Tỷ lệ tiết kiệm ở mức rủi ro** (${savingsRate.toFixed(1)}%): Chi tiêu thực tế đang chiếm phần lớn thu nhập của bạn. Hãy rà soát lại các khoản chi không thiết yếu (như ăn uống ngoài, mua sắm ngẫu hứng) để giữ dòng tiền nhàn rỗi ở mức tối thiểu 20%.
* **Đầu tư tích lũy định kỳ**: Kỷ luật tích sản đóng vai trò quyết định. Đừng đợi đến cuối tháng mới đầu tư số còn lại; thay vào đó, áp dụng nguyên tắc "Trả cho bản thân trước" ngay khi nhận lương.
* **Gia cố bệ đỡ**: Nếu quỹ dự phòng của bạn chưa đạt 3 tháng, hãy chuyển toàn bộ số tiết kiệm thừa của tháng này vào tài khoản gửi góp kỳ hạn ngắn trước khi đầu tư ETF chứng khoán.`;
      } else if (savingsRate < 30) {
        review = `* **Tỷ lệ tích lũy ổn định** (${savingsRate.toFixed(1)}%): Bạn đang duy trì lối sống lành mạnh và kiểm soát chi tiêu ở mức chấp nhận được. Có thể rà soát quỹ ngân sách để tối ưu thêm 5-10% dòng tiền chuyển vào tích sản.
* **Tích cực phân bổ ETF**: Việc duy trì đầu tư ${invested.toLocaleString('vi-VN')} ₫ là một thói quen rất tốt giúp tài sản tăng trưởng kép bền vững. Hãy giữ vững sự kiên định qua các chu kỳ thị trường.
* **Chú trọng đầu tư kỹ năng**: Giai đoạn này hãy dành tối thiểu 5% ngân sách cho việc cập nhật kiến thức, mua khóa học chuyên môn để gia tăng thu nhập chủ động.`;
      } else {
        review = `* **Sức khỏe tài chính tuyệt vời** (${savingsRate.toFixed(1)}% tỷ lệ tiết kiệm): Bạn đang kiểm soát chi phí cực kỳ chặt chẽ hoặc có nguồn thu nhập vượt trội trong tháng này. Đây là điểm tựa vàng để bứt phá tự do tài chính.
* **Đầu tư hiệu quả**: Bạn đã giải ngân ${invested.toLocaleString('vi-VN')} ₫. Với thói quen này, mục tiêu tự do tài chính dài hạn sẽ đến sớm hơn nhiều so với dự kiến.
* **Tận dụng cơ hội**: Có thể cân cân nhắc chia nhỏ phần tích lũy dôi dư, một phần gia tăng tốc độ tích lũy ETF rổ VN30, phần còn lại lập quỹ vốn kinh doanh/side hustle bổ trợ.`;
      }

      return res.json({ review });
    }
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
