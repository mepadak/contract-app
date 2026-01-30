import { z } from 'zod';

// 계약 종류
export const categorySchema = z.enum([
  'GOODS_PURCHASE',
  'GOODS_MANUFACTURE',
  'SERVICE',
  'CONSTRUCTION',
]);

// 계약 방법
export const methodSchema = z.enum([
  'OPEN_BID',
  'RESTRICTED_BID',
  'NOMINATED_BID',
  'OPEN_NEGOTIATION',
  'PRIVATE_NEGOTIATION',
]);

// 계약 상태
export const statusSchema = z.enum([
  'BEFORE_START',
  'IN_PROGRESS',
  'WAITING',
  'DELAYED',
  'COMPLETED',
  'DELETED',
]);

// 계약 생성 스키마
export const createContractSchema = z.object({
  title: z.string().min(1, '계약명은 필수입니다'),
  category: categorySchema,
  method: methodSchema,
  // 금액 필드
  amount: z.number().int().nonnegative().optional().default(0), // 하위호환
  budget: z.number().int().nonnegative().optional().default(0), // 예산
  contractAmount: z.number().int().nonnegative().optional().default(0), // 계약금액
  executionAmount: z.number().int().nonnegative().optional().default(0), // 집행금액
  // 기본 정보
  requester: z.string().optional().nullable(),
  requesterContact: z.string().optional().nullable(),
  contractor: z.string().optional().nullable(),
  // 일자 필드
  deadline: z.string().optional().nullable(), // 하위호환 (마감일)
  requestDate: z.string().optional().nullable(), // 요청일
  announcementStart: z.string().optional().nullable(), // 공고시작일
  announcementEnd: z.string().optional().nullable(), // 공고종료일
  openingDate: z.string().optional().nullable(), // 개찰일
  contractStart: z.string().optional().nullable(), // 계약시작일
  contractEnd: z.string().optional().nullable(), // 계약종료일
  paymentDate: z.string().optional().nullable(), // 대금집행일
});

// 계약 수정 스키마
export const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  category: categorySchema.optional(),
  method: methodSchema.optional(),
  // 금액 필드
  amount: z.number().int().nonnegative().optional(),
  budget: z.number().int().nonnegative().optional(),
  contractAmount: z.number().int().nonnegative().optional(),
  executionAmount: z.number().int().nonnegative().optional(),
  // 기본 정보
  requester: z.string().optional().nullable(),
  requesterContact: z.string().optional().nullable(),
  contractor: z.string().optional().nullable(),
  stage: z.string().optional(),
  status: statusSchema.optional(),
  // 일자 필드
  deadline: z.string().optional().nullable(),
  requestDate: z.string().optional().nullable(),
  announcementStart: z.string().optional().nullable(),
  announcementEnd: z.string().optional().nullable(),
  openingDate: z.string().optional().nullable(),
  contractStart: z.string().optional().nullable(),
  contractEnd: z.string().optional().nullable(),
  paymentDate: z.string().optional().nullable(),
});

// 메모 생성 스키마
export const createNoteSchema = z.object({
  content: z.string().min(1, '메모 내용은 필수입니다'),
  tags: z.array(z.string()).optional().default([]),
});

// 계약 목록 조회 쿼리 스키마
export const listContractsQuerySchema = z.object({
  status: statusSchema.optional(),
  category: categorySchema.optional(),
  method: methodSchema.optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sort: z.enum(['updatedAt', 'createdAt', 'deadline', 'amount']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// 타입 추출
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type ListContractsQuery = z.infer<typeof listContractsQuerySchema>;
