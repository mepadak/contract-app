'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] animate-slide-down bg-amber-500 px-4 py-2 text-center shadow-lg">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
        <WifiOff className="h-4 w-4" />
        <span>인터넷 연결이 끊어졌습니다</span>
      </div>
    </div>
  );
}
