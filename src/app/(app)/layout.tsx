'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Sidebar, TopNav, BottomNav } from '@/components/Navigation';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && !profile) {
      router.replace('/onboarding');
    }
  }, [authLoading, user, profile, router]);

  // Show spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in: AuthGuard handles redirect to /
  if (!user) return null;

  // No profile yet: redirect to onboarding
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
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
