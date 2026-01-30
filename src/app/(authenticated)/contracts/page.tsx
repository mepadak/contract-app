'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, FileText, RefreshCw, SlidersHorizontal, X, Check, List, FolderTree } from 'lucide-react';
import { ContractCard, ContractCardSkeleton } from '@/components/contract/contract-card';
import { ContractDetailModal } from '@/components/contract/contract-detail-modal';
import { ContractTree } from '@/components/contract/contract-tree';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, CATEGORY_LABELS, METHOD_LABELS } from '@/lib/constants';
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

interface Filters {
  status: Status | '';
  category: Category | '';
  method: Method | '';
}

const FILTER_OPTIONS = {
  status: Object.entries(STATUS_LABELS).filter(([key]) => key !== 'DELETED'),
  category: Object.entries(CATEGORY_LABELS),
  method: Object.entries(METHOD_LABELS),
};

export default function ContractsPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 필터 상태
  const [filters, setFilters] = useState<Filters>({
    status: '',
    category: '',
    method: '',
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  // 상세 모달 상태
  const [selectedContract, setSelectedContract] = useState<ContractDetail | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 뷰 모드 (list / tree)
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  // 활성 필터 개수
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // 계약 목록 조회
  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.method) params.set('method', filters.method);

      const response = await fetch(`/api/contracts?${params}`);
      if (!response.ok) throw new Error('목록 조회 실패');

      const data = await response.json();
      setContracts(data.contracts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

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

  // 초기 로드 및 검색/필터 변경 시 조회
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContracts();
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchContracts, searchQuery]);

  // 하이라이트된 계약 자동 열기
  useEffect(() => {
    if (highlightId && !isLoading && contracts.length > 0) {
      const contract = contracts.find((c) => c.id === highlightId);
      if (contract) {
        fetchContractDetail(highlightId);
      }
    }
  }, [highlightId, isLoading, contracts]);

  // 필터 모달 열기
  const handleOpenFilterModal = () => {
    setTempFilters(filters);
    setFilterModalOpen(true);
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setFilterModalOpen(false);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setTempFilters({ status: '', category: '', method: '' });
  };

  // 필터 칩 클릭 (특정 필터 제거)
  const handleRemoveFilter = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

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
            onClick={handleOpenFilterModal}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
              activeFilterCount > 0
                ? 'bg-accent-50 border-accent-200 text-accent-600'
                : 'bg-surface-secondary border-surface-tertiary text-text-tertiary hover:text-text-primary hover:border-accent-primary/30'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center text-[10px] font-medium text-white bg-accent-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
              viewMode === 'tree'
                ? 'bg-accent-50 border-accent-200 text-accent-600'
                : 'bg-surface-secondary border-surface-tertiary text-text-tertiary hover:text-text-primary hover:border-accent-primary/30'
            )}
            title={viewMode === 'list' ? '부서별 그룹' : '목록 보기'}
          >
            {viewMode === 'list' ? <FolderTree className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => fetchContracts()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary border border-surface-tertiary text-text-tertiary hover:text-text-primary hover:border-accent-primary/30 transition-all"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        </div>

        {/* 활성 필터 칩 */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.status && (
              <button
                onClick={() => handleRemoveFilter('status')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-700 bg-accent-50 rounded-full hover:bg-accent-100 transition-colors"
              >
                {STATUS_LABELS[filters.status]}
                <X className="h-3 w-3" />
              </button>
            )}
            {filters.category && (
              <button
                onClick={() => handleRemoveFilter('category')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-700 bg-accent-50 rounded-full hover:bg-accent-100 transition-colors"
              >
                {CATEGORY_LABELS[filters.category]}
                <X className="h-3 w-3" />
              </button>
            )}
            {filters.method && (
              <button
                onClick={() => handleRemoveFilter('method')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-accent-700 bg-accent-50 rounded-full hover:bg-accent-100 transition-colors"
              >
                {METHOD_LABELS[filters.method]}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
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
                <h2 className="text-xl font-semibold text-text-primary">
                  {activeFilterCount > 0 ? '검색 결과가 없습니다' : '계약이 없습니다'}
                </h2>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {activeFilterCount > 0 ? (
                    '다른 조건으로 검색해보세요'
                  ) : (
                    <>
                      채팅으로 새 계약을 등록해보세요
                      <br />
                      <span className="text-text-tertiary">&quot;서버 유지보수 5천만원 등록해줘&quot;</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 계약 목록
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-tertiary mb-2">총 {contracts.length}건</p>
            {viewMode === 'tree' ? (
              <ContractTree
                contracts={contracts}
                onContractClick={fetchContractDetail}
              />
            ) : (
              contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  {...contract}
                  onClick={() => fetchContractDetail(contract.id)}
                />
              ))
            )}
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
          onRefresh={() => {
            fetchContracts();
            // 현재 선택된 계약 다시 조회
            if (selectedContract) {
              fetchContractDetail(selectedContract.id);
            }
          }}
        />
      )}

      {/* 필터 모달 */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">필터</h3>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 상태 필터 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">상태</label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.status.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setTempFilters((prev) => ({
                          ...prev,
                          status: prev.status === key ? '' : (key as Status),
                        }))
                      }
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        tempFilters.status === key
                          ? 'bg-accent-600 text-white border-accent-600'
                          : 'bg-surface-secondary text-text-secondary border-transparent hover:border-accent-300'
                      )}
                    >
                      {tempFilters.status === key && <Check className="h-3 w-3 inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 종류 필터 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">종류</label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.category.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setTempFilters((prev) => ({
                          ...prev,
                          category: prev.category === key ? '' : (key as Category),
                        }))
                      }
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        tempFilters.category === key
                          ? 'bg-accent-600 text-white border-accent-600'
                          : 'bg-surface-secondary text-text-secondary border-transparent hover:border-accent-300'
                      )}
                    >
                      {tempFilters.category === key && <Check className="h-3 w-3 inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 계약 방법 필터 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">계약 방법</label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.method.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setTempFilters((prev) => ({
                          ...prev,
                          method: prev.method === key ? '' : (key as Method),
                        }))
                      }
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        tempFilters.method === key
                          ? 'bg-accent-600 text-white border-accent-600'
                          : 'bg-surface-secondary text-text-secondary border-transparent hover:border-accent-300'
                      )}
                    >
                      {tempFilters.method === key && <Check className="h-3 w-3 inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleResetFilters}
                className="flex-1 px-4 py-3 text-sm font-medium text-text-secondary bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors"
              >
                초기화
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-accent-600 rounded-xl hover:bg-accent-700 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
