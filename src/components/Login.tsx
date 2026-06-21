import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { ToastData } from './Toast';
import { OsbaLogo } from './MoonLoader';

interface LoginProps {
  onToast: (t: Omit<ToastData, 'id'>) => void;
}

export function Login({ onToast }: LoginProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      onToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Username atau password salah',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <OsbaLogo size={48} />
        <div>
          <p className="text-lg font-bold text-black leading-tight">Sistem Pendataan</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest">OSBA</p>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-black mb-1">Masuk</h1>
      <p className="text-sm text-blue-600 mb-8">Sistem Pendataan & Keuangan OSBA</p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-black block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-200"
              placeholder="masukkan username"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-black block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 pr-12 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-200"
                placeholder="masukkan password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-8">© 2026 Sistem Pendataan OSBA</p>
    </div>
  );
}
