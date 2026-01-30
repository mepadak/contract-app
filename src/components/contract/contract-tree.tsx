'use client';

import { useState, useMemo } from 'react';
import { cn, formatAmountShort } from '@/lib/utils';
import { ChevronRight, Building2, Coins, FileText } from 'lucide-react';
import { ContractCard } from './contract-card';
import type { Status, Category, Method } from '@prisma/client';

interface Contract {
  id: string;
  title: string;
  category: Category;
  method: Method;
  amount: number;
  amountFormatted: string;
  status: Status;
  stage: string;
  progress: number;
  requester: string | null;
  contractor: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContractTreeProps {
  contracts: Contract[];
  onContractClick: (id: string) => void;
}

interface GroupedContracts {
  [key: string]: Contract[];
}

export function ContractTree({ contracts, onContractClick }: ContractTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 요청부서별 그룹화
  const groupedContracts = useMemo(() => {
    const groups: GroupedContracts = {};

    contracts.forEach((contract) => {
      const key = contract.requester || '미지정';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contract);
    });

    // 부서명 기준 정렬
    const sortedGroups: GroupedContracts = {};
    Object.keys(groups)
      .sort((a, b) => {
        // '미지정'은 항상 마지막
        if (a === '미지정') return 1;
        if (b === '미지정') return -1;
        return a.localeCompare(b, 'ko');
      })
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [contracts]);

  // 그룹 토글
  const toggleGroup = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // 그룹별 통계 계산
  const getGroupStats = (items: Contract[]) => {
    const totalAmount = items.reduce((sum, c) => sum + c.amount, 0);
    return {
      count: items.length,
      totalAmount,
      totalAmountFormatted: formatAmountShort(totalAmount),
    };
  };

  return (
    <div className="space-y-2">
      {Object.entries(groupedContracts).map(([department, items]) => {
        const isExpanded = expanded.has(department);
        const stats = getGroupStats(items);

        return (
          <div key={department} className="bg-surface-primary rounded-2xl border border-surface-tertiary overflow-hidden">
            {/* 그룹 헤더 */}
            <button
              onClick={() => toggleGroup(department)}
              className="w-full flex items-center gap-3 p-4 hover:bg-surface-secondary/50 transition-colors"
            >
              <ChevronRight
                className={cn(
                  'w-5 h-5 text-text-tertiary transition-transform duration-200',
                  isExpanded && 'rotate-90'
                )}
              />
              <Building2 className="w-5 h-5 text-accent-primary" />
              <div className="flex-1 text-left">
                <span className="font-medium text-text-primary">{department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-text-secondary">
                  <FileText className="w-4 h-4" />
                  {stats.count}건
                </span>
                <span className="flex items-center gap-1 text-text-primary font-medium">
                  <Coins className="w-4 h-4 text-accent-primary" />
                  {stats.totalAmountFormatted}
                </span>
              </div>
            </button>

            {/* 그룹 내용 */}
            {isExpanded && (
              <div className="border-t border-surface-tertiary">
                <div className="p-3 space-y-3">
                  {items.map((contract) => (
                    <ContractCard
                      key={contract.id}
                      {...contract}
                      onClick={() => onContractClick(contract.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
