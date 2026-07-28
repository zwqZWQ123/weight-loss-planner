'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/exercise', label: '运动', icon: Dumbbell },
  { href: '/nutrition', label: '饮食', icon: Apple },
  { href: '/progress', label: '进度', icon: TrendingUp },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[200px] border-r z-40 bg-[var(--background)] hidden md:flex flex-col">
      <div className="p-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--accent)] flex items-center justify-center">
            <span className="text-black font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-sm tracking-wider uppercase">减重计划</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-l-2 border-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30'
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
        </button>
      </div>
    </aside>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const profile = useStore((s) => s.profile);
  const currentLabel = navItems.find((item) => item.href === pathname)?.label || '减重计划';

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-12 border-b bg-[var(--background)] z-40 flex items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[var(--accent)] flex items-center justify-center">
          <span className="text-black font-bold text-xs">W</span>
        </div>
        <span className="font-bold text-xs tracking-wider">
          {profile ? currentLabel : '减重计划'}
        </span>
      </Link>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 border-t bg-[var(--background)] z-40 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 transition-colors',
              isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
            )}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
