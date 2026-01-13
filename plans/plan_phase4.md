# Phase 4: 최적화 및 배포 계획

## 개요
PRD Phase 4에 따른 성능 최적화, UX 개선, 빌드 검증, 배포 준비 및 전체 문서화 작업 수행

## 현재 상태 분석
- Phase 1-3 완료: 기반 구축, 핵심 기능, 대시보드/검색
- Edge Runtime 활성화됨
- 기본적인 로딩 상태 처리됨
- 에러 바운더리 미구현
- 스켈레톤 로딩 50% 적용률

---

## 작업 계획 (10단계)

### Step 1: Next.js 설정 강화
**파일**: `next.config.ts`
- 압축 설정 추가
- 보안 헤더 추가 (CSP, X-Frame-Options, X-Content-Type-Options 등)
- 캐시 헤더 설정 (정적 파일)

### Step 2: 에러 바운더리 구현
**파일**:
- `src/app/error.tsx` - 앱 에러 바운더리
- `src/app/(authenticated)/error.tsx` - 인증 영역 에러 바운더리
- `src/app/global-error.tsx` - 전역 에러 처리

**기능**:
- 에러 발생 시 폴백 UI 표시
- 재시도 버튼 제공
- 콘솔 에러 로깅

### Step 3: Loading UI 추가
**파일**:
- `src/app/(authenticated)/loading.tsx` - 인증 영역 페이지 전환 로딩
- `src/app/(authenticated)/chat/loading.tsx` - 채팅 페이지 로딩
- `src/app/(authenticated)/dashboard/loading.tsx` - 대시보드 로딩
- `src/app/(authenticated)/contracts/loading.tsx` - 계약 목록 로딩

### Step 4: Not Found 페이지
**파일**: `src/app/not-found.tsx`
- 404 페이지 커스터마이징
- 홈으로 돌아가기 버튼
- frontend-design 스킬 적용한 세련된 UI

### Step 5: 오프라인 상태 처리
**파일**:
- `src/hooks/useOnlineStatus.ts` - 온라인 상태 감지 훅
- `src/components/ui/offline-indicator.tsx` - 오프라인 알림 배너
- `src/app/layout.tsx` 수정 - 오프라인 인디케이터 추가

### Step 6: 터치 피드백 개선
**파일**: `src/app/globals.css`
- 터치 피드백 애니메이션 추가
- 버튼 active/hover 상태 강화
- 탭 가능 요소 시각적 피드백 개선

### Step 7: Vercel 빌드 테스트
- `npm run build` 실행
- 빌드 에러 확인 및 수정
- 번들 사이즈 확인
- ESLint 검증

### Step 8: 전체 문서화
**파일**:
- `README.md` - 프로젝트 설명 및 API 문서 추가
- `docs/USER_GUIDE.md` - 사용자 가이드 작성
- `docs/OPERATION_GUIDE.md` - 운영 가이드 작성

**내용**:
- API 엔드포인트 명세
- 사용 가능한 명령어 안내
- 환경 변수 설정 방법
- 배포 및 모니터링 가이드

### Step 9: 계획 문서 저장
**파일**: `plans/plan_phase4.md`
- 이 계획 문서를 프로젝트 내 plans/ 폴더에 저장

### Step 10: Git 커밋/푸시
- 모든 변경사항 커밋 ("Phase 4: 최적화 및 배포 완료")
- 작업 완료 후 `plans/plan_phase4_completed.md` 작성
- main 브랜치 푸시

---

## 수정 대상 파일

### 신규 생성 (15개)
```
src/
├── app/
│   ├── error.tsx                          # 앱 에러 바운더리
│   ├── global-error.tsx                   # 전역 에러 처리
│   ├── not-found.tsx                      # 404 페이지
│   └── (authenticated)/
│       ├── error.tsx                      # 인증 영역 에러 바운더리
│       ├── loading.tsx                    # 인증 영역 로딩
│       ├── chat/loading.tsx               # 채팅 로딩
│       ├── dashboard/loading.tsx          # 대시보드 로딩
│       └── contracts/loading.tsx          # 계약 목록 로딩
├── components/
│   └── ui/
│       └── offline-indicator.tsx          # 오프라인 배너
├── hooks/
│   └── useOnlineStatus.ts                 # 온라인 상태 훅
docs/
├── USER_GUIDE.md                          # 사용자 가이드
└── OPERATION_GUIDE.md                     # 운영 가이드
plans/
├── plan_phase4.md                         # 계획 문서
└── plan_phase4_completed.md               # 완료 문서
```

### 수정 (4개)
```
next.config.ts                             # 최적화 설정 추가
src/app/globals.css                        # 터치 피드백 스타일
src/app/layout.tsx                         # 오프라인 인디케이터 추가
README.md                                  # API 문서 추가
```

---

## 검증 방법

1. **빌드 테스트**: `npm run build` 성공 확인
2. **ESLint**: 경고/에러 0개 확인
3. **에러 바운더리**: 의도적 에러 발생 시 폴백 UI 표시 확인
4. **오프라인 처리**: 네트워크 차단 시 알림 표시 확인
5. **로딩 상태**: 페이지 전환 시 로딩 UI 표시 확인
6. **404 페이지**: 잘못된 경로 접근 시 Not Found 표시 확인

---

## 문서화 상세 내용

### README.md 추가 내용
- 프로젝트 소개
- 기술 스택
- 빠른 시작 가이드
- API 엔드포인트 명세
- 환경 변수 목록

### USER_GUIDE.md
- 앱 사용법
- 자연어 명령어 예시
- 계약 관리 워크플로우
- 대시보드 활용법

### OPERATION_GUIDE.md
- Vercel 배포 방법
- 환경 변수 설정
- 데이터베이스 설정
- 모니터링 및 로깅
- 문제 해결 가이드

---

## 예상 산출물
- 에러 처리가 강화된 안정적인 앱
- 부드러운 로딩 경험 (페이지별 loading.tsx)
- 오프라인 인식 기능
- 404 커스텀 페이지
- 완전한 문서화 (API, 사용자, 운영)
- Vercel 배포 준비 완료
- Git 커밋/푸시 완료
