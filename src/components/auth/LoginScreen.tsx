/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { Mail, Lock, User, Sparkles, Eye, EyeOff, AlertCircle, ArrowRight, Sun, Moon, Globe } from 'lucide-react';

export function LoginScreen() {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, error, setError } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useUI();
  
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-12 select-none font-sans relative transition-colors duration-205">
      
      {/* Floating control header */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer shadow-md"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          type="button"
          className="p-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer font-bold font-mono text-[10px] shadow-sm active:scale-95"
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span className="uppercase">{language}</span>
        </button>
      </div>

      {/* Brand logo header */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow shadow-emerald-500/15">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white font-sans sm:text-2xl">
          FinCopilot <span className="text-emerald-400 font-mono">VND</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1 max-w-sm px-4">
          {language === 'vi' 
            ? 'Hệ sinh thái phân bổ dòng tiền nhàn rỗi tích sản thông minh ứng dụng Trí Tuệ Nhân Tạo.' 
            : 'Personal financial co-pilot powered by high-speed generative AI models.'}
        </p>
      </div>

      {/* Main card box */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-200">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-lg font-bold text-zinc-100">
            {isRegister 
              ? (language === 'vi' ? 'Tạo tài khoản mới' : 'Create new account') 
              : (language === 'vi' ? 'Chào mừng bạn quay lại' : 'Welcome back')}
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isRegister 
              ? (language === 'vi' ? 'Đăng ký tài khoản trong 30 giây để bắt đầu lập kế hoạch tài chính.' : 'Sign up in 30 seconds to start secure financial planning.') 
              : (language === 'vi' ? 'Đăng nhập để xem danh mục tịnh tài và nhận phân tích dòng tiền chuyên sâu.' : 'Log in to inspect active asset allocations and receive custom AI streams.')}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-400/10 border border-red-500/20 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold whitespace-pre-line">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1.5">
              <label htmlFor="auth_name" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                {language === 'vi' ? 'Họ và tên' : 'Full Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-650">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth_name"
                  type="text"
                  placeholder={language === 'vi' ? 'Ví dụ: Nguyễn Minh Anh' : 'e.g. John Doe'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 text-zinc-100 text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder-zinc-500 font-medium"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth_email" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
              {language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-655">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth_email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 text-zinc-100 text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all placeholder-zinc-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth_pwd" className="block text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
              {language === 'vi' ? 'Mật khẩu bảo vệ' : 'Protect Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-655">
                <Lock className="w-4 h-4" />
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer mt-2"
          >
            {loading ? (
              <span>{language === 'vi' ? 'Đang xác thực hệ thống...' : 'Validating database security...'}</span>
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
          </button>
        </form>

        {/* Divider separator */}
        <div className="my-6 flex items-center justify-between text-zinc-600">
          <span className="w-full border-t border-zinc-800" />
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider px-3 shrink-0">
            {language === 'vi' ? 'Hoặc tiếp tục với' : 'Or continue using'}
          </span>
          <span className="w-full border-t border-zinc-800" />
        </div>

        {/* Google SignIn Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow focus:outline-none cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>{language === 'vi' ? 'Đăng nhập qua Google account' : 'Sign in with Google credentials'}</span>
        </button>

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

      </div>

      <div className="mt-8 text-[10px] text-zinc-600 font-mono text-center max-w-sm leading-normal">
        <p>{language === 'vi' ? 'Mã hóa cục bộ SSL kết hợp hệ mã bảo mật Firebase.' : 'Encrypted with client-side SSL and Firebase identity keys.'}</p>
        <p className="mt-0.5">{language === 'vi' ? 'Trạng thái hạ tầng: Hoàn hảo' : 'Infrastructure security state: Perfect'}</p>
      </div>

    </div>
  );
}

export default LoginScreen;
