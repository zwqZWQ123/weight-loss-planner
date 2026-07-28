'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, TopNav, BottomNav } from '@/components/Navigation';
import { useStore } from '@/store/useStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);

  useEffect(() => {
    if (!profile) {
      router.push('/');
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  return (
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
  );
}
