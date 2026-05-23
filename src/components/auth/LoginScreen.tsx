/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Sun, 
  Moon, 
  Globe, 
  Shield, 
  Coins, 
  TrendingUp, 
  Zap, 
  Terminal, 
  FileSpreadsheet, 
  PiggyBank, 
  BrainCircuit,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LoginScreen() {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, error, setError } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useUI();
  
  // State to toggle between the beautiful Features Onboarding (About) and the actual Sign in form
  const [viewIntro, setViewIntro] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !displayName)) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ tất cả các trường.' : 'Please fill in all fields thoroughly.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await signUpWithEmail(email, displayName, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.warn('Authentication err:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google authentication err:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col justify-center items-center px-4 py-8 font-sans overflow-hidden relative transition-colors duration-200">
      
      {/* BACKGROUND GRAPHICS: Cyber-Mesh & Rotating Orbits */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Neon blur blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[180px]" />

        {/* Outer Orbit lines */}
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] top-[calc(50%-400px)] left-[calc(50%-400px)] border border-zinc-800/20 rounded-full border-dashed"
        />
        <motion.div 
          initial={{ rotate: 180 }}
          animate={{ rotate: -180 }}
          transition={{ duration: 130, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] top-[calc(50%-250px)] left-[calc(50%-250px)] border border-emerald-500/5 rounded-full"
        />
      </div>

      {/* Floating control header */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer shadow-md"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          type="button"
          className="p-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer font-bold font-mono text-[10px] shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span className="uppercase">{language}</span>
        </button>
      </div>

      {/* Brand logo header (Always visible for brand consistency) */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6 text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2.5xl font-extrabold tracking-tight text-white font-sans sm:text-3.5xl">
          FinCopilot <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">DCA</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1.5 max-w-sm px-4">
          {language === 'vi' 
            ? 'La bàn kỹ thuật số giúp bạn làm chủ dòng tiền nhàn rỗi tích sản thông minh ứng dụng AI.' 
            : 'Personal financial co-pilot powered by high-speed generative AI models.'}
        </p>
      </motion.div>

      {/* Dynamic Slide Container via AnimatePresence */}
      <AnimatePresence mode="wait">
        
        {viewIntro ? (
          /* ========================================================
             1. ABOUT / INTRO SCREEN VIEW
             ======================================================== */
          <motion.div
            key="intro-panel"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-3xl bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)] relative z-10 space-y-6"
          >
            {/* Header intro info */}
            <div className="text-center space-y-1 max-w-xl mx-auto">
              <span className="text-[10px] tracking-widest text-emerald-400 font-bold uppercase font-mono bg-emerald-500/10 px-3 py-1 rounded-full">
                {language === 'vi' ? 'Hệ thống định vị tài chính thế hệ mới' : 'Next-Generation Financial Steering System'}
              </span>
              <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight sm:text-2xl mt-2.5">
                {language === 'vi' ? 'Thắp sáng tương lai, tự chủ tích lũy số' : 'Chart Your Path to Financial Freedom'}
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                {language === 'vi' 
                  ? 'Khám phá giải pháp phân bổ thặng dư dòng tiền kỷ luật, giảm thiểu tác động lạm phát bằng công nghệ trí tuệ nhân tạo phòng vệ vững vàng.' 
                  : 'Bridge the gap between raw wealth and strategic compounding using dynamic risk-reward portfolios and artificial intelligence.'}
              </p>
            </div>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Pillar 1: Flow Review */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-200 group">
                <div className="flex gap-3">
                  <div className="p-2 w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">{language === 'vi' ? 'Thẩm định Dòng tiền' : 'Cashflow Audit'}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      {language === 'vi' 
                        ? 'Chấm điểm kỷ luật chi tiêu hằng tháng, phát hiện rò rỉ ngân sách và thắt chặt dòng tiền nhàn rỗi.' 
                        : 'Review monthly budgets, prevent financial leakage, and build systematic cash cushions.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 2: AI Advisor */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-200 group">
                <div className="flex gap-3">
                  <div className="p-2 w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">{language === 'vi' ? 'Cơ cấu phân bổ Tối ưu' : 'Smart Capital Allocation'}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      {language === 'vi' 
                        ? 'Cân đối rổ tài sản dự phòng và tích sản chỉ số ETF dựa vào khẩu vị rủi ro và lĩnh vực chuyên môn.' 
                        : 'Deploy adaptive portfolios from cash reserves to long-term broad indices matched to your profile.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 3: DCA Simulator */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-200 group">
                <div className="flex gap-3">
                  <div className="p-2 w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">{language === 'vi' ? 'Giả lập Kỷ luật DCA' : 'Compound DCA Engine'}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      {language === 'vi' 
                        ? 'Giả lập lộ trình tích sản thực tế đối kháng lạm phát để xác định chính xác điểm cột mốc tự do tài chính.' 
                        : 'Model continuous asset path projections against real inflation vectors to gauge long-term compounding.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 4: AI Side Hustles */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 transition-all duration-200 group">
                <div className="flex gap-3">
                  <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">{language === 'vi' ? 'Ý tưởng Thu nhập Phụ' : 'AI Side Hustles'}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      {language === 'vi' 
                        ? 'Gợi ý các cơ hội Freelance và tự động hóa ứng dụng AI để đẩy nhanh tiến độ gia tăng thặng dư.' 
                        : 'Unlock custom blueprints to fuel extra revenue blocks using generative models and side hustles.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Launch Button Action */}
            <div className="pt-2 text-center flex flex-col items-center justify-center space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewIntro(false)}
                type="button"
                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm tracking-tight transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] border-t border-white/20"
              >
                <span>{language === 'vi' ? 'Bắt đầu ngay' : 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </motion.button>
              
              <p className="text-[10px] text-zinc-600 font-mono">
                {language === 'vi' ? 'Miễn phí tích hợp • Thiết kế cho Zero-Knowledge' : 'Free integration • Zero-Knowledge Design'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             2. ACTUAL SECURE AUTHENTICATION FORM (Login / Register Card)
             ======================================================== */
          <motion.div 
            key="auth-card"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)] relative overflow-hidden z-10 transition-all duration-200"
          >
            {/* Back button to Intro screen */}
            <button
              onClick={() => {
                setViewIntro(true);
                setError(null);
              }}
              type="button"
              className="absolute top-6 left-6 text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer group transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
            </button>

            {/* Decorative corner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-6 mt-6 relative">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>
                  {isRegister 
                    ? (language === 'vi' ? 'Tạo tài khoản mới' : 'Create new account') 
                    : (language === 'vi' ? 'Chào mừng bạn quay lại' : 'Welcome back')}
                </span>
              </h2>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                {isRegister 
                  ? (language === 'vi' ? 'Đăng ký tài khoản trong 30 giây để bắt đầu lập kế hoạch tài chính.' : 'Sign up in 30 seconds to start secure financial planning.') 
                  : (language === 'vi' ? 'Đăng nhập để xem danh mục tịnh tài và nhận phân tích dòng tiền chuyên sâu.' : 'Log in to inspect active asset allocations and receive custom AI streams.')}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-450/10 border border-red-500/20 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold whitespace-pre-line">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <AnimatePresence mode="popLayout">
                {isRegister && (
                  <motion.div 
                    key="register-name"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5"
                  >
                    <label htmlFor="auth_name" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        id="auth_name"
                        type="text"
                        placeholder={language === 'vi' ? 'Ví dụ: Nguyễn Minh Anh' : 'e.g. John Doe'}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 text-zinc-100 text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder-zinc-550 font-medium"
                        required={isRegister}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label htmlFor="auth_email" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                  {language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input
                    id="auth_email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 text-zinc-100 text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder-zinc-550 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth_pwd" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                  {language === 'vi' ? 'Mật khẩu bảo vệ' : 'Protect Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input
                    id="auth_pwd"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 text-zinc-100 text-xs rounded-lg pl-9 pr-10 py-2.5 outline-none transition-all placeholder-zinc-655 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer animate-none bg-transparent border-none outline-none"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{language === 'vi' ? 'Đang giải mã dữ liệu...' : 'Decrypting data blocks...'}</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {isRegister 
                        ? (language === 'vi' ? 'Đăng ký tài khoản' : 'Register Account') 
                        : (language === 'vi' ? 'Đăng nhập ứng dụng' : 'Secure Log In')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider separator */}
            <div className="my-6 flex items-center justify-between text-zinc-700">
              <span className="w-full border-t border-zinc-900" />
              <span className="text-[9px] uppercase font-bold font-mono tracking-widest px-3.5 shrink-0 select-none">
                {language === 'vi' ? 'HOẶC' : 'OR'}
              </span>
              <span className="w-full border-t border-zinc-900" />
            </div>

            {/* Google SignIn Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow focus:outline-none cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>{language === 'vi' ? 'Đăng nhập qua Google Account' : 'Sign in with Google Account'}</span>
            </motion.button>

            {/* Card footer switch */}
            <div className="mt-6 text-center text-xs">
              <p className="text-zinc-500">
                {isRegister 
                  ? (language === 'vi' ? 'Đã có tài khoản FinCopilot?' : 'Already have an account?') 
                  : (language === 'vi' ? 'Chưa có tài khoản FinCopilot?' : 'No account set up yet?')}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold ml-1.5 underline focus:outline-none cursor-pointer"
                >
                  {isRegister 
                    ? (language === 'vi' ? 'Đăng nhập ngay' : 'Log in here') 
                    : (language === 'vi' ? 'Đăng ký tài khoản' : 'Sign up here')}
                </button>
              </p>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Security credentials badge list */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-[10px] text-zinc-600 font-mono text-center max-w-sm leading-normal space-y-1 z-10"
      >
        <div className="flex justify-center items-center gap-4 text-zinc-500 mb-2">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Zero-Knowledge Serverless</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-500" />
            <span>DCA Portfolio Automation</span>
          </div>
        </div>
        <p>{language === 'vi' ? 'Mã hóa cục bộ SSL kết hợp hệ mã bảo mật Firebase.' : 'Encrypted with client-side SSL and Firebase identity keys.'}</p>
        <p className="text-zinc-650">{language === 'vi' ? 'Hạ tầng: Cloud Secure Pro' : 'Infrastructure status: Cloud Secure Pro'}</p>
      </motion.div>

    </div>
  );
}

export default LoginScreen;
