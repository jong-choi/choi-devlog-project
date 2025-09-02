# 관리자 페이지 상세 기획안

## 프로젝트 개요

components/post/right-panel 에 있는 AI 기능들을 관리자 페이지에서 일괄 관리하기 위한 페이지

## 핵심 요구사항

1. **게시글 목록과 AI 요약 상태 표시**: 각 게시글의 AI 요약 존재 여부를 한눈에 확인
2. **추천 게시글 개수 표시**: 각 게시글의 연관 추천 게시글 개수를 표시
3. **게시글별 AI 기능 실행**: 목록에서 바로 AI 요약 생성 및 추천 게시글 생성 가능

## 데이터베이스 분석 결과

### 주요 테이블 구조

- **posts**: 게시글 기본 정보 (id, title, body, url_slug, is_private, released_at 등)
- **ai_summaries**: AI 요약 데이터 (post_id, summary, created_at)
- **ai_summary_vectors**: AI 요약 벡터 (summary_id, vector)
- **post_similarities**: 게시글 간 유사도 (source_post_id, target_post_id, similarity)

### 관련 뷰

- **published_posts**: 공개된 게시글만 필터링
- **post_similarities_with_target_info**: 유사도와 함께 타겟 게시글 정보 포함

## API 엔드포인트 분석

### 기존 AI 관련 API

1. **POST /api/summary**: AI 요약 생성 (OpenAI GPT-4o 사용)
2. **POST /api/summary/recommended**: 추천 게시글 생성 (벡터 유사도 기반)
3. **GET /api/(fetchers)/ai/summary?post_id={id}**: AI 요약 조회
4. **GET /api/(fetchers)/ai/recommended?post_id={id}**: 추천 게시글 목록 조회

## 관리자 페이지 상세 기획

### 1. 게시글 관리 테이블

```
┌─────────────┬──────────────┬─────────┬─────────┬─────────────┬──────────┐
│ 제목        │ 발행일       │ AI요약  │ 추천개수│ 요약생성    │ 추천생성 │
├─────────────┼──────────────┼─────────┼─────────┼─────────────┼──────────┤
│ Next.js ... │ 2024-01-15  │ ✅      │ 5개     │ [재생성]    │ [재생성] │
│ React Hook  │ 2024-01-10  │ ❌      │ 0개     │ [생성하기]  │ [생성하기]│
│ TypeScript  │ 2024-01-05  │ ✅      │ 3개     │ [재생성]    │ [재생성] │
└─────────────┴──────────────┴─────────┴─────────┴─────────────┴──────────┘
```

### 2. 필요한 데이터 구조

```typescript
interface AdminPostData {
  id: string;
  title: string;
  url_slug: string;
  released_at: string;
  is_private: boolean;
  ai_summary?: {
    id: string;
    summary: string;
    created_at: string;
  };
  recommended_count: number;
  similarity_data?: Array<{
    target_post_id: string;
    similarity: number;
    target_title: string;
  }>;
}
```

### 3. 페이지 구성 요소

#### 헤더 섹션

- **제목**: "AI 콘텐츠 관리"
- **통계 카드**:
  - 전체 게시글 수
  - AI 요약 생성 완료 게시글 수
  - 추천 연결 완료 게시글 수
  - 평균 추천 게시글 개수

#### 필터 섹션

- **상태 필터**: 전체 / AI요약 있음 / AI요약 없음 / 추천 있음 / 추천 없음
- **날짜 필터**: 발행일 기준
- **검색**: 제목으로 검색
- **정렬**: 발행일, 제목, AI요약 상태, 추천 개수

#### 액션 섹션

- **일괄 선택**: 체크박스로 다중 선택
- **일괄 실행**: 선택된 게시글들에 대해 AI 요약/추천 일괄 생성

### 4. 상세 기능

#### AI 요약 상태 표시

- ✅ **생성 완료**: AI 요약이 존재하는 경우
- ❌ **미생성**: AI 요약이 없는 경우
- ⏳ **생성 중**: API 호출 중인 경우
- ⚠️ **오류**: 생성 실패한 경우

#### 추천 게시글 개수 표시

- **숫자**: 현재 연결된 추천 게시글 개수 (0~10개)
- **색상 코딩**:
  - 0개: 회색 (미연결)
  - 1-3개: 주황색 (부족)
  - 4-7개: 파란색 (보통)
  - 8-10개: 초록색 (충분)

#### 버튼 기능

- **[생성하기]**: 해당 기능이 없을 때 새로 생성
- **[재생성]**: 이미 있는 데이터를 새로 생성 (확인 다이얼로그)
- **[보기]**: AI 요약 내용이나 추천 목록 미리보기

### 5. API 설계 (신규 필요)

#### GET /api/admin/posts

관리자용 게시글 목록 조회 (AI 상태 포함)

```typescript
// Response
{
  posts: AdminPostData[];
  total: number;
  summary: {
    totalPosts: number;
    withAISummary: number;
    withRecommendations: number;
    averageRecommendations: number;
  };
}
```

#### POST /api/admin/ai/batch-summary

선택된 게시글들에 대해 AI 요약 일괄 생성

```typescript
// Request
{
  postIds: string[];
}
// Response
{
  success: string[];
  failed: Array<{postId: string, error: string}>;
}
```

#### POST /api/admin/ai/batch-recommendations

선택된 게시글들에 대해 추천 게시글 일괄 생성

```typescript
// Request
{
  postIds: string[];
}
// Response
{
  success: string[];
  failed: Array<{postId: string, error: string}>;
}
```

### 6. 사용자 경험 (UX)

#### 로딩 상태

- 개별 버튼: 로딩 스피너와 함께 비활성화
- 일괄 처리: 진행률 바 표시
- 실시간 업데이트: 완료된 항목부터 즉시 반영

#### 오류 처리

- 개별 실패: 해당 행에 오류 메시지 표시
- 일괄 실패: 실패한 항목들의 목록과 사유 표시
- 재시도: 실패한 항목들만 선택해서 재시도 가능

#### 확인 다이얼로그

- 재생성 시: "기존 데이터를 덮어쓰시겠습니까?"
- 일괄 처리 시: "X개 게시글에 대해 작업을 실행하시겠습니까?"

### 7. 성능 최적화

#### 데이터 로딩

- 페이지네이션: 기본 20개씩 로드
- 가상 스크롤: 대량 데이터 처리시 적용
- 캐싱: React Query로 데이터 캐싱

#### API 최적화

- 병렬 처리: 일괄 작업시 동시 실행 (단, OpenAI API 제한 고려)
- 큐 시스템: 대량 작업시 순차 처리
- 진행률 추적: WebSocket 또는 polling으로 상태 업데이트

### 8. 접근 권한

- 관리자만 접근 가능 (인증 미들웨어)
- 읽기 전용 뷰어와 편집 권한 구분 가능하도록 설계

### 9. 구현 우선순위

#### Phase 1 (필수 기능)

1. 게시글 목록 조회 API 구현
2. AI 요약 상태 표시
3. 추천 게시글 개수 표시
4. 개별 AI 요약/추천 생성 버튼

#### Phase 2 (향상 기능)

1. 일괄 처리 기능
2. 필터링 및 검색
3. 진행률 표시 및 실시간 업데이트

#### Phase 3 (최적화)

1. 성능 최적화 (가상 스크롤, 캐싱)
2. 오류 처리 개선
3. 사용자 경험 향상

### 10. 기술 스택

- **프론트엔드**: Next.js 14, React, TypeScript, Tailwind CSS
- **상태 관리**: Zustand (기존 패턴 유지)
- **데이터 페칭**: React Query 또는 SWR
- **UI 컴포넌트**: 기존 컴포넌트 라이브러리 활용
- **백엔드**: Next.js API Routes
- **데이터베이스**: Supabase PostgreSQL
