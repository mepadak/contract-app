'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, RefreshCw } from 'lucide-react';
import { ContractCard, ContractCardSkeleton } from '@/components/contract/contract-card';
import { ContractDetailModal } from '@/components/contract/contract-detail-modal';
import { cn } from '@/lib/utils';
import type { Status, Category, Method, Action } from '@prisma/client';

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

interface ContractDetail {
  id: string;
  title: string;
  category: Category;
  method: Method;
  amount: number;
  amountFormatted: string;
  status: Status;
  stage: string;
  progress: number;
  stages: string[];
  requester: string | null;
  requesterContact: string | null;
  contractor: string | null;
  deadline: string | null;
  budgetYear: number;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: number;
  content: string;
  tags: string[];
  createdAt: string;
}

interface HistoryItem {
  id: number;
  action: Action;
  detail: string | null;
  from: string | null;
  to: string | null;
  createdAt: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 상세 모달 상태
  const [selectedContract, setSelectedContract] = useState<ContractDetail | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 계약 목록 조회
  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/contracts?${params}`);
      if (!response.ok) throw new Error('목록 조회 실패');

      const data = await response.json();
      setContracts(data.contracts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 계약 상세 조회
  const fetchContractDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (!response.ok) throw new Error('상세 조회 실패');

      const data = await response.json();
      setSelectedContract(data.contract);
      setSelectedNotes(data.notes);
      setSelectedHistory(data.history);
      setIsModalOpen(true);
    } catch (err) {
      console.error('상세 조회 오류:', err);
    }
  };

  // 초기 로드 및 검색 변경 시 조회
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContracts();
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchContracts, searchQuery]);

  return (
    <div className="flex flex-1 flex-col">
      {/* 검색 바 */}
      <div className="p-4 border-b border-surface-tertiary bg-surface-primary/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary border border-surface-tertiary focus-within:border-accent-primary/50 focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
            <Search className="h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="계약 검색..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchContracts()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary border border-surface-tertiary text-text-tertiary hover:text-text-primary hover:border-accent-primary/30 transition-all"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // 로딩 스켈레톤
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <ContractCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          // 에러 상태
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
            <div className="text-center">
              <p className="text-text-secondary mb-4">{error}</p>
              <button
                onClick={() => fetchContracts()}
                className="px-4 py-2 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : contracts.length === 0 ? (
          // 빈 상태
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary/10 to-accent-primary/5">
                <FileText className="h-10 w-10 text-accent-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">계약이 없습니다</h2>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  채팅으로 새 계약을 등록해보세요
                  <br />
                  <span className="text-text-tertiary">&quot;서버 유지보수 5천만원 등록해줘&quot;</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 계약 목록
          <div className="p-4 space-y-3 pb-24">
            <p className="text-xs text-text-tertiary mb-2">
              총 {contracts.length}건
            </p>
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                {...contract}
                onClick={() => fetchContractDetail(contract.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          notes={selectedNotes}
          history={selectedHistory}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
}
