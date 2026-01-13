'use client';

import { Header } from './header';
import { BottomNav } from './bottom-nav';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  title?: string;
  headerAction?: React.ReactNode;
}

export function MobileLayout({
  children,
  showHeader = true,
  showNav = true,
  title,
  headerAction,
}: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen-safe flex-col bg-surface-secondary">
      {/* Header */}
      {showHeader && <Header title={title} action={headerAction} />}

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-auto
          ${showNav ? 'pb-20' : ''}
          ${showHeader ? '' : 'pt-safe'}
        `}
      >
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}
