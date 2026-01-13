'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, LayoutDashboard, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/chat', label: '채팅', icon: MessageCircle },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/contracts', label: '목록', icon: FileText },
  { href: '/settings', label: '설정', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Top shadow gradient */}
      <div
        className="h-6 w-full pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(254, 254, 254, 0.9), transparent)',
        }}
      />

      {/* Navigation Bar */}
      <div className="glass-effect border-t border-border-subtle shadow-nav pb-safe">
        <div className="flex h-14 items-center justify-around px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1',
                  'transition-all duration-200',
                  'press-effect'
                )}
              >
                {/* Active Indicator */}
                <span
                  className={cn(
                    'absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full',
                    'transition-all duration-300',
                    isActive
                      ? 'bg-accent-500 opacity-100'
                      : 'bg-transparent opacity-0'
                  )}
                />

                {/* Icon Container */}
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    'transition-all duration-200',
                    isActive
                      ? 'text-accent-600'
                      : 'text-text-tertiary group-hover:text-text-secondary'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[22px] w-[22px] transition-transform duration-200',
                      isActive && 'scale-105'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium tracking-tight',
                    'transition-colors duration-200',
                    isActive
                      ? 'text-accent-600'
                      : 'text-text-tertiary group-hover:text-text-secondary'
                  )}
                >
                  {label}
                </span>

                {/* Hover/Touch Background */}
                <span
                  className={cn(
                    'absolute inset-1 -z-10 rounded-xl',
                    'transition-all duration-200',
                    'group-hover:bg-surface-tertiary/50',
                    'group-active:bg-surface-tertiary'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
