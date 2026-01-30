-- CreateEnum
CREATE TYPE "Category" AS ENUM ('물품(구매)', '물품(제조)', '용역', '공사');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('일반경쟁', '제한경쟁', '지명경쟁', '공개수의', '비공개수의');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('시작 전', '진행 중', '대기', '지연', '완료', '삭제');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'UPDATE', 'STAGE', 'STATUS', 'NOTE', 'DELETE', 'BUDGET');

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "method" "Method" NOT NULL,
    "requester" TEXT,
    "requester_contact" TEXT,
    "budget_year" INTEGER NOT NULL DEFAULT 2026,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "budget" BIGINT NOT NULL DEFAULT 0,
    "contract_amount" BIGINT NOT NULL DEFAULT 0,
    "execution_amount" BIGINT NOT NULL DEFAULT 0,
    "contractor" TEXT,
    "deadline" DATE,
    "request_date" DATE,
    "announcement_start" DATE,
    "announcement_end" DATE,
    "opening_date" DATE,
    "contract_start" DATE,
    "contract_end" DATE,
    "payment_date" DATE,
    "status" "Status" NOT NULL DEFAULT '시작 전',
    "stage" TEXT NOT NULL DEFAULT '공고준비',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "contract_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_logs" (
    "id" SERIAL NOT NULL,
    "contract_id" TEXT,
    "action" "Action" NOT NULL,
    "detail" TEXT,
    "from_value" TEXT,
    "to_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pin_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "configs"("key");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
