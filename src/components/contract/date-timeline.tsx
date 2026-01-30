'use client';

import { cn } from '@/lib/utils';
import {
  Calendar,
  FileText,
  Megaphone,
  CheckCircle,
  FileSignature,
  Wallet,
} from 'lucide-react';

interface DateTimelineProps {
  requestDate: string | null;
  announcementStart: string | null;
  announcementEnd: string | null;
  openingDate: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  paymentDate: string | null;
  deadline?: string | null; // 하위호환
}

interface TimelineItem {
  label: string;
  date: string | null;
  icon: React.ElementType;
  color: string;
}

export function DateTimeline({
  requestDate,
  announcementStart,
  announcementEnd,
  openingDate,
  contractStart,
  contractEnd,
  paymentDate,
  deadline,
}: DateTimelineProps) {
  const timelineItems: TimelineItem[] = [
    { label: '요청일', date: requestDate, icon: FileText, color: 'slate' },
    { label: '공고시작', date: announcementStart, icon: Megaphone, color: 'blue' },
    { label: '공고종료', date: announcementEnd, icon: Megaphone, color: 'blue' },
    { label: '개찰일', date: openingDate, icon: CheckCircle, color: 'indigo' },
    { label: '계약시작', date: contractStart, icon: FileSignature, color: 'violet' },
    { label: '계약종료', date: contractEnd, icon: FileSignature, color: 'amber' },
    { label: '대금집행', date: paymentDate, icon: Wallet, color: 'emerald' },
  ];

  // 입력된 일자가 있는 항목만 필터링
  const filledItems = timelineItems.filter(item => item.date);

  // 아무 일자도 없고 deadline도 없으면 렌더링 안함
  if (filledItems.length === 0 && !deadline) {
    return null;
  }

  // 하위호환: deadline만 있는 경우
  if (filledItems.length === 0 && deadline) {
    return (
      <div className="bg-surface-secondary rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-tertiary" />
          <span className="text-xs text-text-tertiary">마감일</span>
          <span className="text-sm font-medium text-text-primary ml-auto">{deadline}</span>
        </div>
      </div>
    );
  }

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-300' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-300' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  };

  return (
    <div className="relative">
      {/* 타임라인 세로선 */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-surface-tertiary" />

      <div className="space-y-3">
        {filledItems.map((item) => {
          const Icon = item.icon;
          const colors = colorClasses[item.color] || colorClasses.slate;

          return (
            <div key={item.label} className="relative flex items-center gap-3 pl-1">
              {/* 아이콘 */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-5 h-5 rounded-full',
                colors.bg
              )}>
                <Icon className={cn('w-3 h-3', colors.text)} />
              </div>

              {/* 내용 */}
              <div className="flex-1 flex items-center justify-between bg-surface-secondary rounded-lg px-3 py-2">
                <span className="text-xs text-text-secondary">{item.label}</span>
                <span className="text-sm font-medium text-text-primary">{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
