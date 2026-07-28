'use client';

import { useEffect, useState } from 'react';
import { login, register, isLoggedIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { loadUserData } from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      loadUserData();
      router.replace('/onboarding');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(username, password);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        loadUserData();
        router.replace('/onboarding');
      } else {
        if (password !== password2) { setError('两次密码输入不一致'); setLoading(false); return; }
        const result = await register(username, password);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        router.replace('/onboarding');
      }
    } catch {
      setError('操作失败，请重试');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-[var(--accent)] mx-auto mb-4 flex items-center justify-center">
            <span className="text-black font-bold text-2xl">W</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">减重计划</h1>
          <p className="text-sm text-[var(--muted)] mt-1">登录以管理你的数据</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs tracking-wider text-[var(--muted)] uppercase">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="输入用户名"
              autoComplete="username"
              className="w-full bg-transparent border px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] transition-colors mt-1.5" />
          </div>
          <div>
            <label className="text-xs tracking-wider text-[var(--muted)] uppercase">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-transparent border px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] transition-colors mt-1.5" />
          </div>
          {mode === 'register' && (
            <div>
              <label className="text-xs tracking-wider text-[var(--muted)] uppercase">确认密码</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="再次输入密码"
                autoComplete="new-password"
                className="w-full bg-transparent border px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] transition-colors mt-1.5" />
            </div>
          )}
          {error && <div className="text-xs text-[var(--danger)] border border-[var(--danger)]/30 px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[var(--accent)] text-black font-semibold text-sm hover:brightness-110 transition-all tracking-wider disabled:opacity-50">
            {loading ? '处理中...' : mode === 'login' ? '登 录' : '注 册'}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              {mode === 'login' ? '没有账号？注册新用户' : '已有账号？去登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
