/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SideHustleIdea, Profile } from '../types';
import { LoadingAI } from '../components/shared/LoadingAI';
import { formatVND } from '../lib/utils/vnd';
import { Sparkles, Calendar, Zap, AlertCircle, Laptop, Wrench, ShieldQuestion, HelpCircle } from 'lucide-react';

interface SideHustleProps {
  profile: Profile;
  sideHustles: SideHustleIdea[];
  updateSideHustles: (ideas: SideHustleIdea[]) => void;
}

const CATEGORY_TAGS: Record<string, { label: string; text: string; bg: string }> = {
  micro_saas: { label: 'Micro-SaaS', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ai_automation: { label: 'Tự Động Hóa AI', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  freelance: { label: 'Freelancer', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  consulting: { label: 'Tư Vấn Chuyên Sâu', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  digital_product: { label: 'Sản Phẩm Số', text: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export function SideHustle({ profile, sideHustles, updateSideHustles }: SideHustleProps) {
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(30); // 30 hours nhàn rỗi/tháng
  const [skills, setSkills] = useState<string[]>(profile.skills || ['React', 'TypeScript', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleSkill = (tag: string) => {
    setSkills((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills((prev) => [...prev, clean]);
      setSkillInput('');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/side-hustle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem(`fincopilot_apikey_${profile.id}`) || '',
        },
        body: JSON.stringify({
          skills,
          career_field: profile.career_field,
          monthly_free_hours: hours,
        }),
      });

      if (!res.ok) {
        throw new Error('Đường truyền máy chủ AI lỗi.');
      }

      const data = await res.json();
      updateSideHustles(data.ideas || []);
    } catch (err: any) {
      console.warn(err);
      setErrorMsg('Không thể tiếp nối đến Co-pilot. Hệ thống đã kích hoạt rổ ý tưởng phụ cục bộ dự phòng cho bạn.');
      const fallbackIdeas: SideHustleIdea[] = [
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
          title: 'Viết Bản tin Chuyên môn Substack dựa trên kỹ năng của bạn',
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
          title: 'Thiết kế UI/UX Landing Page hoặc Slide trọn gói cho Brand local',
          category: 'freelance',
          description: 'Cung cấp dịch vụ tối ưu tỷ lệ chuyển đổi Landing page và làm mới giao diện bản chào hoặc web bán hàng.',
          estimated_monthly_vnd: [7000000, 20000000],
          time_to_first_revenue_weeks: 3,
          difficulty: 'medium',
          first_steps: [
            'Dựng portfolio gồm 3 bản thiết kế bản chào demo tiện ích hoặc giao diện mẫu.',
            'Tạo profile uy tín trên Behance và các sàn làm việc tự do Việt Nam như vLance.',
            'Pitching trực tiếp kế hoạch tối ưu cho các nhãn hàng nhỏ đang có hiển thị cũ kỹ.'
          ],
          tools_needed: ['Figma', 'Framer', 'Webflow', 'Canva']
        },
        {
          title: 'Phát triển Template Notion quản lý KPI & Tài chính chi tiết',
          category: 'digital_product',
          description: 'Sáng tạo các bảng biểu tinh lọc cho đối tượng sinh viên và người đi làm bận rộn tiện tra cứu và tối ưu ngày.',
          estimated_monthly_vnd: [3000000, 10000000],
          time_to_first_revenue_weeks: 5,
          difficulty: 'low',
          first_steps: [
            'Dựng hệ thống theo dõi trực quan liên quan đến dòng tiền cá nhân hoặc mục tiêu KPI ngày.',
            'Quay video hướng dẫn hoặc tài liệu sử dụng ngắn, rõ ràng.',
            'Phân phối miễn phí lấy email đầu tiên trên Gumroad, sau đó chuyển sang bản trả phí trên các hội thảo.'
          ],
          tools_needed: ['Notion', 'Loom', 'Gumroad']
        }
      ];
      updateSideHustles(fallbackIdeas);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI Side Hustle Ideas"
        subtitle="Giải phóng năng lực nhàn rỗi cá nhân và bóc tách kỹ năng cốt lõi để gia tăng dòng thu nhập phụ, bơm thêm vốn cho tịnh tài DCA."
      />

      {/* Control panel widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-1 backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-zinc-200 text-sm font-bold border-b border-zinc-850 pb-2.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            Thiết lập đầu vào thu nhập phụ
          </h3>

          {/* NHÀN RỖI HOURS SLIDER */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-zinc-400 uppercase tracking-wider">Thời gian nhàn rỗi mỗi tháng</span>
              <span className="text-emerald-400 font-mono">{hours} Giờ/tháng</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-950 rounded h-1 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 leading-normal">Tương đương tầm ~{(hours / 4).toFixed(1)} giờ rảnh mỗi tuần (cuối tuần + buổi tối).</p>
          </div>

          {/* ACTIVE KỸ NĂNG CHIPS GIAO DIỆN */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Kỹ năng mang ra thương mại</span>
            
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
              {skills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className="py-1 px-2 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-[10px] text-emerald-400 font-bold font-semibold transition-all flex items-center gap-1 shrink-0"
                >
                  <span>{sk}</span>
                  <span className="text-red-400 text-xs hover:text-red-500">×</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSkill} className="flex gap-1">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Ví dụ: n8n, nộp CV..."
                className="bg-zinc-950 text-xs outline-none border border-zinc-800 rounded px-2.5 py-1 flex-1 text-zinc-200 placeholder-zinc-700"
              />
              <button
                type="submit"
                className="py-1 px-3 bg-zinc-800 border border-zinc-750 text-xs rounded text-zinc-200 font-bold"
              >
                + Thêm
              </button>
            </form>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-400 font-medium">{errorMsg}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || skills.length === 0}
            className="w-full py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-500/90 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gợi ý Side Hustle AI</span>
          </button>
        </div>

        {/* Dynamic ideas list/grid display Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingAI message="Co-pilot đang quét rổ kỹ năng và tìm thị trường ngách..." />
            </div>
          ) : (
            <>
              {sideHustles && sideHustles.length > 0 ? (
                <div className="space-y-5">
                  <h3 className="text-zinc-300 font-bold text-xs flex items-center gap-1.5 px-1 uppercase tracking-widest">
                    <span>Đề xuất từ Co-pilot ({sideHustles.length} Cơ hội)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sideHustles.map((idea, index) => {
                      const cat = CATEGORY_TAGS[idea.category] || { label: idea.category, text: 'text-zinc-400', bg: 'bg-zinc-800' };
                      
                      return (
                        <div
                          key={index}
                          className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg"
                        >
                          {/* Title and Category Badge details */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-semibold uppercase ${cat.text} ${cat.bg}`}>
                                {cat.label}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                idea.difficulty === 'high' ? 'bg-red-500/10 text-red-400' :
                                idea.difficulty === 'medium' ? 'bg-indigo-500/10 text-indigo-400' :
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {idea.difficulty === 'high' ? 'Khó' : idea.difficulty === 'medium' ? 'Vừa' : 'Dễ'}
                              </span>
                            </div>
                            <h4 className="text-zinc-100 font-bold text-sm tracking-tight leading-snug">
                              {idea.title}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed font-sans mt-1">
                              {idea.description}
                            </p>
                          </div>

                          {/* Financial estimations metrics */}
                          <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-2.5 rounded border border-zinc-850 text-xs">
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Thu nhập ước tính</span>
                              <strong className="text-emerald-400 font-mono text-xs">
                                {formatVND(idea.estimated_monthly_vnd[0], true)} - {formatVND(idea.estimated_monthly_vnd[1], true)} /T
                              </strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Có khách hàng đầu tiên</span>
                              <strong className="text-indigo-400 font-mono text-xs">
                                t.b {idea.time_to_first_revenue_weeks} Tuần
                              </strong>
                            </div>
                          </div>

                          {/* Tools lists chips list */}
                          {idea.tools_needed && idea.tools_needed.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold font-semibold block flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                Công cụ khuyên dùng
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {idea.tools_needed.map((t, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 font-mono text-zinc-400">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Concrete First Steps */}
                          {idea.first_steps && idea.first_steps.length > 0 && (
                            <div className="border-t border-zinc-900/40 pt-3 space-y-1.5 flex-1">
                              <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold font-semibold block">
                                3 Bước thực hành ban đầu:
                              </span>
                              <ol className="list-decimal pl-4 text-[11px] text-zinc-300 leading-relaxed font-sans space-y-1">
                                {idea.first_steps.map((st, i) => (
                                  <li key={i}>{st}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-lg bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-16 text-center space-y-4 max-w-md mx-auto shadow-xl">
                  <Laptop className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-zinc-200 font-bold">Kích hoạt rổ kiến tạo thu nhập phụ</h4>
                    <p className="text-zinc-500 text-xs">
                      Sử dụng trí thông minh Gemini để rà soát kỹ năng chính, tạo ra các đề xuất micro-saas, viết tài liệu số hoặc làm tự động hóa AI nhắm đúng thị trường ngách Việt Nam.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={skills.length === 0}
                    className="py-2 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded text-xs transition-colors shadow"
                  >
                    Xem cơ hội side hustle ngay
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default SideHustle;
