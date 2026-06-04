import React, { useState } from 'react';
import { supabaseAuth } from '../lib/supabase';
import { User } from '../types';
import { Loader2, X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode === 'register' && !username) return;
    
    // Check username valid for URL safety
    if (mode === 'register' && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و خط تیره باشد');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    const { error: err } = await supabaseAuth.sendOtp(email, mode, mode === 'register' ? username : undefined);
    setLoading(false);
    
    if (err) {
      if (err.message.includes('Signups not allowed')) {
        setError('کاربری با این ایمیل یافت نشد. لطفا ابتدا ثبت نام کنید.');
      } else {
        setError(err.message);
      }
    } else {
      setStep('code');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError('');
    
    const { user, error: err } = await supabaseAuth.verifyOtp(email, code);
    setLoading(false);
    
    if (err) {
      setError(err.message);
    } else if (user) {
      onLogin(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 text-center font-bold ${mode === 'login' ? 'text-[#2B547E] border-b-2 border-[#2B547E]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setMode('login'); setStep('email'); setError(''); setMessage(''); setCode(''); }}
          >
            ورود
          </button>
          <button 
            className={`flex-1 py-4 text-center font-bold ${mode === 'register' ? 'text-[#2B547E] border-b-2 border-[#2B547E]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setMode('register'); setStep('email'); setError(''); setMessage(''); setCode(''); }}
          >
            ثبت نام
          </button>
        </div>

        <div className="p-6">
          {step === 'email' ? (
          <form onSubmit={handleSendLink} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری (انگلیسی)</label>
                <input 
                  type="text" 
                  value={username}
                  required
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B547E] text-left"
                  placeholder="Example: MDavoudi"
                  dir="ltr"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
              <input 
                type="email" 
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B547E] text-left"
                placeholder="Example: MohammadDavoudi@gmail.com"
                dir="ltr"
              />
            </div>
            
            {error && <p className="text-sm text-red-500 leading-tight">{error}</p>}
            {message && <p className="text-sm text-green-600 leading-tight p-2 bg-green-50 rounded border border-green-200">{message}</p>}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2B547E] hover:bg-[#1a334d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B547E] disabled:opacity-70 transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'ارسال کد ورود' : 'ثبت نام و ارسال کد'}
            </button>
          </form>
          ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد تایید ارسال شده به ایمیل</label>
              <input 
                type="text" 
                value={code}
                required
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B547E] text-center tracking-widest text-lg font-mono"
                placeholder="----"
                dir="ltr"
                maxLength={6}
              />
            </div>
            
            {error && <p className="text-sm text-red-500 max-w-[300px] leading-tight">{error}</p>}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2B547E] hover:bg-[#1a334d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B547E] disabled:opacity-70 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'بررسی و ورود'}
            </button>
            
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="w-full text-sm text-[#2B547E] hover:text-[#1a334d] mt-2 block text-center"
            >
              تغییر آدرس ایمیل
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
