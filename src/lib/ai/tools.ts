import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseKoreanAmount, formatAmountShort } from '@/lib/utils';
import { METHOD_STAGES } from '@/lib/constants';
import { Category, Method, Status, Action } from '@prisma/client';

// 계약 ID 생성 헬퍼
async function generateContractId(): Promise<string> {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  const counterKey = `id_counter_${year}`;

  let config = await prisma.config.findUnique({
    where: { key: counterKey },
  });

  if (!config) {
    config = await prisma.config.create({
      data: { key: counterKey, value: '1' },
    });
  }

  const counter = parseInt(config.value, 10);

  await prisma.config.update({
    where: { key: counterKey },
    data: { value: (counter + 1).toString() },
  });

  return `C${yearShort}-${counter.toString().padStart(3, '0')}`;
}

// 카테고리 매핑
function mapCategory(input: string): Category {
  const normalized = input.toLowerCase();
  if (normalized.includes('제조') || normalized.includes('제작')) {
    return Category.GOODS_MANUFACTURE;
  }
  if (normalized.includes('물품') || normalized.includes('구매')) {
    return Category.GOODS_PURCHASE;
  }
  if (normalized.includes('공사') || normalized.includes('시설') || normalized.includes('건설')) {
    return Category.CONSTRUCTION;
  }
  return Category.SERVICE; // 기본값: 용역
}

// 메서드 매핑
function mapMethod(input: string): Method {
  const normalized = input.toLowerCase();
  if (normalized.includes('제한')) {
    return Method.RESTRICTED_BID;
  }
  if (normalized.includes('지명')) {
    return Method.NOMINATED_BID;
  }
  if (normalized.includes('공개수의')) {
    return Method.OPEN_NEGOTIATION;
  }
  if (normalized.includes('수의') || normalized.includes('비공개')) {
    return Method.PRIVATE_NEGOTIATION;
  }
  return Method.OPEN_BID; // 기본값: 일반경쟁
}

// 상태 매핑
function mapStatus(input: string): Status {
  const normalized = input.toLowerCase();
  if (normalized.includes('진행') || normalized === 'in_progress') {
    return Status.IN_PROGRESS;
  }
  if (normalized.includes('대기') || normalized === 'waiting') {
    return Status.WAITING;
  }
  if (normalized.includes('지연') || normalized === 'delayed') {
    return Status.DELAYED;
  }
  if (normalized.includes('완료') || normalized === 'completed') {
    return Status.COMPLETED;
  }
  return Status.BEFORE_START;
}

// 메서드 라벨 가져오기
function getMethodLabel(method: Method): string {
  const labels: Record<Method, string> = {
    [Method.OPEN_BID]: '일반경쟁',
    [Method.RESTRICTED_BID]: '제한경쟁',
    [Method.NOMINATED_BID]: '지명경쟁',
    [Method.OPEN_NEGOTIATION]: '공개수의',
    [Method.PRIVATE_NEGOTIATION]: '비공개수의',
  };
  return labels[method];
}

// 초기 단계 결정
function getInitialStage(method: Method): string {
  if (method === Method.PRIVATE_NEGOTIATION) {
    return '계약준비';
  }
  return '공고준비';
}

export const contractTools = {
  // 계약 생성
  createContract: tool({
    description: '새로운 계약을 생성합니다. 계약명, 종류, 방법은 필수입니다.',
    inputSchema: z.object({
      title: z.string().describe('계약명'),
      category: z.string().describe('계약 종류 (물품, 용역, 공사 등)'),
      method: z.string().describe('계약 방법 (일반경쟁, 수의계약 등)'),
      amount: z.string().optional().describe('계약 금액 (예: 5천만원, 5억) - 하위호환용'),
      budget: z.string().optional().describe('예산 금액 (예: 5천만원, 5억)'),
      contractAmount: z.string().optional().describe('계약금액 (예: 4천만원)'),
      requester: z.string().optional().describe('요청 부서'),
      deadline: z.string().optional().describe('마감일 (YYYY-MM-DD 형식)'),
      requestDate: z.string().optional().describe('요청일 (YYYY-MM-DD 형식)'),
      contractEnd: z.string().optional().describe('계약종료일 (YYYY-MM-DD 형식)'),
    }),
    execute: async ({ title, category, method, amount, budget, contractAmount, requester, deadline, requestDate, contractEnd }) => {
      try {
        const contractId = await generateContractId();
        const mappedCategory = mapCategory(category);
        const mappedMethod = mapMethod(method);
        const initialStage = getInitialStage(mappedMethod);
        const parsedAmount = amount ? (parseKoreanAmount(amount) ?? 0) : 0;
        const parsedBudget = budget ? (parseKoreanAmount(budget) ?? 0) : 0;
        const parsedContractAmount = contractAmount ? (parseKoreanAmount(contractAmount) ?? 0) : 0;

        const contract = await prisma.contract.create({
          data: {
            id: contractId,
            title,
            category: mappedCategory,
            method: mappedMethod,
            amount: BigInt(parsedAmount),
            budget: BigInt(parsedBudget),
            contractAmount: BigInt(parsedContractAmount),
            requester: requester || null,
            deadline: deadline ? new Date(deadline) : null,
            requestDate: requestDate ? new Date(requestDate) : null,
            contractEnd: contractEnd ? new Date(contractEnd) : null,
            stage: initialStage,
            status: Status.BEFORE_START,
          },
        });

        // 변경 로그 기록
        await prisma.changeLog.create({
          data: {
            contractId: contract.id,
            action: Action.CREATE,
            detail: `계약 생성: ${title}`,
            toValue: JSON.stringify({
              title,
              category: mappedCategory,
              method: mappedMethod,
              amount: parsedAmount,
            }),
          },
        });

        return {
          success: true,
          contract: {
            id: contract.id,
            title: contract.title,
            category: mappedCategory,
            method: getMethodLabel(mappedMethod),
            amount: parsedAmount,
            amountFormatted: formatAmountShort(parsedAmount),
            budget: parsedBudget,
            budgetFormatted: formatAmountShort(parsedBudget),
            contractAmount: parsedContractAmount,
            contractAmountFormatted: formatAmountShort(parsedContractAmount),
            stage: initialStage,
            status: '시작 전',
            requester: contract.requester,
            deadline: contract.deadline?.toISOString().split('T')[0],
            requestDate: contract.requestDate?.toISOString().split('T')[0],
            contractEnd: contract.contractEnd?.toISOString().split('T')[0],
          },
          message: `계약 ${contract.id}이(가) 생성되었습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '계약 생성 실패',
        };
      }
    },
  }),

  // 계약 목록 조회
  listContracts: tool({
    description: '계약 목록을 조회합니다. 상태, 종류, 방법으로 필터링할 수 있습니다.',
    inputSchema: z.object({
      status: z.string().optional().describe('상태 필터 (시작 전, 진행 중, 대기, 지연, 완료)'),
      category: z.string().optional().describe('종류 필터'),
      method: z.string().optional().describe('방법 필터'),
      limit: z.number().optional().default(20).describe('조회 개수'),
    }),
    execute: async ({ status, category, method, limit }) => {
      try {
        const where: Record<string, unknown> = {
          status: { not: Status.DELETED },
        };

        if (status) {
          where.status = mapStatus(status);
        }
        if (category) {
          where.category = mapCategory(category);
        }
        if (method) {
          where.method = mapMethod(method);
        }

        const contracts = await prisma.contract.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take: limit,
        });

        const formattedContracts = contracts.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          method: c.method,
          amount: Number(c.amount),
          amountFormatted: formatAmountShort(Number(c.amount)),
          status: c.status,
          stage: c.stage,
          deadline: c.deadline?.toISOString().split('T')[0],
        }));

        return {
          success: true,
          contracts: formattedContracts,
          total: formattedContracts.length,
          message: `${formattedContracts.length}건의 계약을 조회했습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '목록 조회 실패',
        };
      }
    },
  }),

  // 계약 상세 조회
  getContract: tool({
    description: '특정 계약의 상세 정보를 조회합니다.',
    inputSchema: z.object({
      contractId: z.string().describe('계약 ID (예: C26-001) 또는 계약명 일부'),
    }),
    execute: async ({ contractId }) => {
      try {
        // ID 또는 제목으로 검색
        const contract = await prisma.contract.findFirst({
          where: {
            OR: [
              { id: contractId },
              { title: { contains: contractId } },
            ],
            status: { not: Status.DELETED },
          },
          include: {
            notes: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        });

        if (!contract) {
          return {
            success: false,
            error: `계약을 찾을 수 없습니다: ${contractId}`,
          };
        }

        // 변경 이력 조회
        const history = await prisma.changeLog.findMany({
          where: { contractId: contract.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        // 진행률 계산
        const methodLabel = getMethodLabel(contract.method);
        const stages = METHOD_STAGES[methodLabel] || [];
        const currentIndex = stages.indexOf(contract.stage);
        const progress = stages.length > 0 ? Math.round(((currentIndex + 1) / stages.length) * 100) : 0;

        return {
          success: true,
          contract: {
            id: contract.id,
            title: contract.title,
            category: contract.category,
            method: contract.method,
            amount: Number(contract.amount),
            amountFormatted: formatAmountShort(Number(contract.amount)),
            status: contract.status,
            stage: contract.stage,
            progress,
            requester: contract.requester,
            contractor: contract.contractor,
            deadline: contract.deadline?.toISOString().split('T')[0],
            createdAt: contract.createdAt.toISOString(),
            updatedAt: contract.updatedAt.toISOString(),
          },
          notes: contract.notes.map((n) => ({
            id: n.id,
            content: n.content,
            tags: n.tags,
            createdAt: n.createdAt.toISOString(),
          })),
          history: history.map((h) => ({
            action: h.action,
            detail: h.detail,
            from: h.fromValue,
            to: h.toValue,
            createdAt: h.createdAt.toISOString(),
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '상세 조회 실패',
        };
      }
    },
  }),

  // 계약 수정 (단계, 상태, 계약상대방 등)
  updateContract: tool({
    description: '계약 정보를 수정합니다. 단계, 상태, 계약상대방, 금액, 일자 등을 변경할 수 있습니다.',
    inputSchema: z.object({
      contractId: z.string().describe('계약 ID'),
      stage: z.string().optional().describe('변경할 단계'),
      status: z.string().optional().describe('변경할 상태'),
      contractor: z.string().optional().describe('계약상대방'),
      amount: z.string().optional().describe('금액 변경 (하위호환)'),
      budget: z.string().optional().describe('예산 변경'),
      contractAmount: z.string().optional().describe('계약금액 변경'),
      executionAmount: z.string().optional().describe('집행금액 변경'),
      paymentDate: z.string().optional().describe('대금집행일 (YYYY-MM-DD 형식) - 입력 시 자동 완료 처리'),
    }),
    execute: async ({ contractId, stage, status, contractor, amount, budget, contractAmount, executionAmount, paymentDate }) => {
      try {
        const contract = await prisma.contract.findFirst({
          where: {
            OR: [{ id: contractId }, { title: { contains: contractId } }],
            status: { not: Status.DELETED },
          },
        });

        if (!contract) {
          return {
            success: false,
            error: `계약을 찾을 수 없습니다: ${contractId}`,
          };
        }

        const updates: Record<string, unknown> = {};
        const changes: Array<{ field: string; from: string; to: string }> = [];

        // 단계 변경
        if (stage) {
          const methodLabel = getMethodLabel(contract.method);
          const validStages = METHOD_STAGES[methodLabel] || [];

          if (!validStages.includes(stage)) {
            return {
              success: false,
              error: `유효하지 않은 단계입니다. 가능한 단계: ${validStages.join(', ')}`,
            };
          }

          updates.stage = stage;
          changes.push({ field: '단계', from: contract.stage, to: stage });

          // 상태 자동 변경
          if (stage === '집행완료') {
            updates.status = Status.COMPLETED;
            changes.push({ field: '상태', from: contract.status, to: '완료' });
          } else if (contract.status === Status.BEFORE_START && stage !== contract.stage) {
            updates.status = Status.IN_PROGRESS;
            changes.push({ field: '상태', from: '시작 전', to: '진행 중' });
          }
        }

        // 상태 변경
        if (status) {
          const mappedStatus = mapStatus(status);
          updates.status = mappedStatus;
          changes.push({ field: '상태', from: contract.status, to: status });
        }

        // 계약상대방 변경
        if (contractor) {
          updates.contractor = contractor;
          changes.push({ field: '계약상대방', from: contract.contractor || '없음', to: contractor });
        }

        // 금액 변경
        if (amount) {
          const parsedAmount = parseKoreanAmount(amount) ?? 0;
          updates.amount = BigInt(parsedAmount);
          changes.push({
            field: '금액',
            from: formatAmountShort(Number(contract.amount)),
            to: formatAmountShort(parsedAmount)
          });
        }

        if (budget) {
          const parsedBudget = parseKoreanAmount(budget) ?? 0;
          updates.budget = BigInt(parsedBudget);
          changes.push({
            field: '예산',
            from: formatAmountShort(Number(contract.budget)),
            to: formatAmountShort(parsedBudget)
          });
        }

        if (contractAmount) {
          const parsedContractAmount = parseKoreanAmount(contractAmount) ?? 0;
          updates.contractAmount = BigInt(parsedContractAmount);
          changes.push({
            field: '계약금액',
            from: formatAmountShort(Number(contract.contractAmount)),
            to: formatAmountShort(parsedContractAmount)
          });
        }

        if (executionAmount) {
          const parsedExecutionAmount = parseKoreanAmount(executionAmount) ?? 0;
          updates.executionAmount = BigInt(parsedExecutionAmount);
          changes.push({
            field: '집행금액',
            from: formatAmountShort(Number(contract.executionAmount)),
            to: formatAmountShort(parsedExecutionAmount)
          });
        }

        // 대금집행일 입력 시 자동 완료 처리
        if (paymentDate) {
          updates.paymentDate = new Date(paymentDate);
          changes.push({
            field: '대금집행일',
            from: contract.paymentDate?.toISOString().split('T')[0] || '없음',
            to: paymentDate
          });
          // 자동으로 상태='완료', 단계='집행완료' 변경
          updates.stage = '집행완료';
          updates.status = Status.COMPLETED;
          changes.push({ field: '단계', from: contract.stage, to: '집행완료' });
          changes.push({ field: '상태', from: contract.status, to: '완료' });
        }

        if (Object.keys(updates).length === 0) {
          return {
            success: false,
            error: '변경할 항목이 없습니다.',
          };
        }

        // 업데이트 실행
        const updated = await prisma.contract.update({
          where: { id: contract.id },
          data: updates,
        });

        // 변경 로그 기록
        for (const change of changes) {
          await prisma.changeLog.create({
            data: {
              contractId: contract.id,
              action: change.field === '단계' ? Action.STAGE : change.field === '상태' ? Action.STATUS : Action.UPDATE,
              detail: `${change.field} 변경`,
              fromValue: change.from,
              toValue: change.to,
            },
          });
        }

        return {
          success: true,
          contract: {
            id: updated.id,
            title: updated.title,
            stage: updated.stage,
            status: updated.status,
            contractor: updated.contractor,
            amount: Number(updated.amount),
            amountFormatted: formatAmountShort(Number(updated.amount)),
          },
          changes,
          message: `${contract.id} 계약이 수정되었습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '계약 수정 실패',
        };
      }
    },
  }),

  // 메모 추가
  addNote: tool({
    description: '계약에 메모를 추가합니다.',
    inputSchema: z.object({
      contractId: z.string().describe('계약 ID'),
      content: z.string().describe('메모 내용'),
      tags: z.array(z.string()).optional().describe('태그 배열'),
    }),
    execute: async ({ contractId, content, tags }) => {
      try {
        const contract = await prisma.contract.findFirst({
          where: {
            OR: [{ id: contractId }, { title: { contains: contractId } }],
            status: { not: Status.DELETED },
          },
        });

        if (!contract) {
          return {
            success: false,
            error: `계약을 찾을 수 없습니다: ${contractId}`,
          };
        }

        // 태그 자동 추출 (간단한 키워드 추출)
        const extractedTags = tags || [];
        if (!tags || tags.length === 0) {
          const keywords = ['검토', '완료', '승인', '요청', '회의', '수정', '확인', '보류', '긴급'];
          keywords.forEach((keyword) => {
            if (content.includes(keyword)) {
              extractedTags.push(keyword);
            }
          });
        }

        const note = await prisma.note.create({
          data: {
            contractId: contract.id,
            content,
            tags: extractedTags,
          },
        });

        // 변경 로그 기록
        await prisma.changeLog.create({
          data: {
            contractId: contract.id,
            action: Action.NOTE,
            detail: '메모 추가',
            toValue: content,
          },
        });

        return {
          success: true,
          note: {
            id: note.id,
            content: note.content,
            tags: note.tags,
            createdAt: note.createdAt.toISOString(),
          },
          message: `${contract.id}에 메모가 추가되었습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '메모 추가 실패',
        };
      }
    },
  }),

  // 계약 삭제
  deleteContract: tool({
    description: '계약을 삭제합니다 (소프트 삭제).',
    inputSchema: z.object({
      contractId: z.string().describe('계약 ID'),
      confirm: z.boolean().describe('삭제 확인 (true면 삭제 실행)'),
    }),
    execute: async ({ contractId, confirm }) => {
      try {
        if (!confirm) {
          return {
            success: false,
            needConfirmation: true,
            message: `정말로 ${contractId} 계약을 삭제하시겠습니까? 삭제된 계약은 목록에서 제외됩니다.`,
          };
        }

        const contract = await prisma.contract.findFirst({
          where: {
            OR: [{ id: contractId }, { title: { contains: contractId } }],
            status: { not: Status.DELETED },
          },
        });

        if (!contract) {
          return {
            success: false,
            error: `계약을 찾을 수 없습니다: ${contractId}`,
          };
        }

        // 소프트 삭제
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: Status.DELETED },
        });

        // 변경 로그 기록
        await prisma.changeLog.create({
          data: {
            contractId: contract.id,
            action: Action.DELETE,
            detail: '계약 삭제',
            fromValue: contract.status,
            toValue: '삭제',
          },
        });

        return {
          success: true,
          message: `${contract.id} (${contract.title}) 계약이 삭제되었습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '계약 삭제 실패',
        };
      }
    },
  }),

  // 예산 설정
  setBudget: tool({
    description: '연간 예산을 설정합니다.',
    inputSchema: z.object({
      amount: z.string().describe('예산 금액 (예: 50억, 5000만원)'),
    }),
    execute: async ({ amount }) => {
      try {
        const year = new Date().getFullYear();
        const budgetKey = 'annual_budget';
        const parsedAmount = parseKoreanAmount(amount) ?? 0;

        await prisma.config.upsert({
          where: { key: budgetKey },
          update: { value: parsedAmount.toString() },
          create: { key: budgetKey, value: parsedAmount.toString() },
        });

        // 변경 로그 기록
        await prisma.changeLog.create({
          data: {
            action: Action.BUDGET,
            detail: `${year}년 예산 설정`,
            toValue: formatAmountShort(parsedAmount),
          },
        });

        return {
          success: true,
          budget: {
            year,
            amount: parsedAmount,
            amountFormatted: formatAmountShort(parsedAmount),
          },
          message: `${year}년 연간 예산이 ${formatAmountShort(parsedAmount)}으로 설정되었습니다.`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '예산 설정 실패',
        };
      }
    },
  }),
};
