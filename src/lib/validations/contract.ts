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
  amount: z.number().int().nonnegative().optional().default(0),
  requester: z.string().optional().nullable(),
  requesterContact: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  contractor: z.string().optional().nullable(),
});

// 계약 수정 스키마
export const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  category: categorySchema.optional(),
  method: methodSchema.optional(),
  amount: z.number().int().nonnegative().optional(),
  requester: z.string().optional().nullable(),
  requesterContact: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  contractor: z.string().optional().nullable(),
  stage: z.string().optional(),
  status: statusSchema.optional(),
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
