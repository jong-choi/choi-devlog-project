관리자 API 추천 수 집계 문제 해결 기록

- 문제: `app/api/(fetchers)/admin/route.ts`에서 게시글별 추천 수를 전체 유사도 데이터를 모두 가져와(JS에서 그룹핑) 계산했다. 이 방식은 기본 행 제한(예: 1000행)이나 페이지네이션 누락으로 인해 특정 `post.id`로 직접 조회했을 때의 실제 개수와 불일치가 발생할 수 있었다.

- 원인: `post_similarities_with_target_info` 테이블을 한 번에 select 후 클라이언트 측에서 카운트 → DB의 반환 행 제한 및 누락 가능성 때문에 정확한 집계가 보장되지 않음.

- 조치: 각 게시글별로 Supabase 카운트 쿼리를 사용해 정확한 개수를 조회하도록 변경.
  - `select('target_post_id', { head: true, count: 'exact' }).eq('source_post_id', post.id)` 형태로, 데이터 본문은 가져오지 않고(head) 정확한 개수만(count) 취득.
  - Admin 페이지가 기대하는 반환 구조(`post.post_similarities[0].count`)는 유지.

- 부가 수정: TypeScript 경고 해결을 위해 `post.id`를 문자열로 안전하게 처리하고, 맵 접근 시 `undefined` 가드를 추가.

- 결과: Admin 페이지의 추천 수가 특정 `post.id`로 조회했을 때(`app/api/(fetchers)/ai/recommended/route.ts`의 기준)와 정확히 일치하도록 표기됨.

- 참고 파일:
  - `app/api/(fetchers)/admin/route.ts`
  - `app/api/(fetchers)/ai/recommended/route.ts`

- 향후 개선 여지: 현재 방식은 게시글 수만큼 N+1 쿼리가 발생함. DB 뷰/머티리얼라이즈드 뷰, RPC, 또는 서버 측 그룹 집계(end-point)로 배치 카운트를 제공해 쿼리 수를 줄일 수 있음.
