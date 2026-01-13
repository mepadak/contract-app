'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export function Header({ title = 'Contract Manager', action }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 pt-safe">
      <div className="glass-effect border-b border-border-subtle">
        <div className="flex h-11 items-center justify-between px-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {action}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="
                flex h-9 w-9 items-center justify-center rounded-lg
                text-text-secondary
                transition-all duration-200
                hover:bg-surface-tertiary hover:text-text-primary
                active:scale-95
              "
              aria-label="메뉴"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle shadow line for depth */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(28, 25, 23, 0.03) 20%, rgba(28, 25, 23, 0.03) 80%, transparent)',
        }}
      />
    </header>
  );
}
