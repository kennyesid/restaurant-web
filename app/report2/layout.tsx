'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { isAuthenticated } from '@/lib/auth';
import { EnvConfig } from '@/config/env.config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // pt-10
  const PADDING_TOP = EnvConfig.paddingTop;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className={`min-h-screen bg-background pt-${PADDING_TOP}`}>
      <Sidebar />
      <DashboardHeader />
      <main className="lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
