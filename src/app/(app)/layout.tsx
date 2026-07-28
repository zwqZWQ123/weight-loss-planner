'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Sidebar, TopNav, BottomNav } from '@/components/Navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/components/useHydrated';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const hydrated = useHydrated();
  const { user } = useAuth();

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/onboarding');
    }
  }, [hydrated, profile, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span className="text-xs text-[var(--muted)]">加载中...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        <Sidebar />
        <TopNav />
        <main className="flex-1 md:ml-[200px] pb-16 md:pb-0 pt-12 md:pt-0">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
