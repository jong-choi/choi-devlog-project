/**
 * 문자열을 URL-friendly한 슬러그(slug)로 변환합니다.
 *
 * - 특수문자를 제거합니다.
 * - 띄어쓰기는 `-`로 대체됩니다.
 * - 모든 문자는 소문자로 변환됩니다.
 *
 * @param {string} title - 변환할 문자열
 * @returns {string} URL-friendly한 슬러그 문자열
 *
 * @example
 * slugify("Hello World!"); // "hello-world"
 * slugify("안녕하세요! Next.js 배우기"); // "안녕하세요-nextjs-배우기"
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD") // 유니코드 정규화 (예: é → e)
    .replace(/[\u0300-\u036f]/g, "") // 발음 기호 제거
    .replace(/[^a-zA-Z0-9\s-]/g, "") // 알파벳, 숫자, 공백, 하이픈만 남김
    .trim() // 앞뒤 공백 제거
    .replace(/\s+/g, "-") // 띄어쓰기를 하이픈(-)으로 변환
    .toLowerCase(); // 소문자로 변환
}

/**
 * 게시글에서 처음으로 발견한 Markdown 이미지의 URL을 추출합니다.
 *
 * - `![]()` 형식의 Markdown 이미지 태그를 찾습니다.
 * - Supabase의 특정 경로(`commonImagePath`)에 해당하는 이미지만 추출합니다.
 * - 첫 번째로 발견된 이미지만 반환합니다.
 * - 이미지가 없는 경우 빈 문자열을 반환합니다.
 *
 * @param {string} postText - 게시글의 본문
 * @returns {string} 추출된 이미지 URL (없으면 빈 문자열)
 *
 * @example
 * const post = "![alt text](https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/post/123/image.jpg)";
 * extractFirstImageFromText(post); // "https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image/post/123/image.jpg"
 *
 * extractFirstImageFromText("텍스트만 있는 게시글"); // ""
 */
export function extractFirstImageFromText(postText: string): string {
  const commonImagePath =
    "https://wknphwqwtywjrfclmhjd.supabase.co/storage/v1/object/public/image";
  const regex = new RegExp(
    `!\\[.*?\\]\\(((${commonImagePath}[^\\s)]+))\\)`,
    "i"
  );
  const match = postText.match(regex);
  return match ? match[1] : "";
}

/**
 * 마크다운 형식의 본문에서 순수한 텍스트만 추출하고, 최대 100자까지만 반환합니다.
 *
 * - 이미지 (`![]()`), 링크(`[text](url)`), 코드 블록(```code```) 등을 제거합니다.
 * - 헤더 (`# 제목`), 리스트 (`- 항목`), 인라인 코드 (`\`code\``) 등을 정리합니다.
 * - 본문의 순수한 텍스트만 반환하며, 최대 100자로 제한합니다.
 *
 * @param {string} markdown - 마크다운 형식의 본문
 * @param {number} [maxLength=100] - 최대 글자 수 (기본값: 100)
 * @returns {string} 최대 `maxLength`까지의 순수한 텍스트 내용
 *
 * @example
 * const md = "# 제목\n\n![image](url)\n이것은 본문입니다. 매우 긴 텍스트...\n\n[링크](https://example.com)";
 * extractTextFromMarkdown(md, 50); // "이것은 본문입니다. 매우 긴 텍스트..."
 */
export function extractTextFromMarkdown(
  markdown: string,
  maxLength: number = 100
): string {
  const text = markdown
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 제거: ![alt](url)
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 링크 텍스트만 유지하고 URL 제거: [text](url) -> text
    .replace(/#+\s?/g, "") // 헤더(#, ##, ###) 제거
    .replace(/(`{3}[\s\S]*?`{3})|(`{1,2}.*?`{1,2})/g, "") // 코드 블록 및 인라인 코드 제거
    .replace(/>+ /g, "") // 인용문 (>) 제거
    .replace(/[*_~`]/g, "") // 강조 표시 (*bold*, _italic_) 제거
    .replace(/- |\* |\+ /g, "") // 리스트(-, *, +) 제거
    .replace(/\s+/g, " ") // 모든 공백(줄바꿈 포함)을 단일 스페이스로 변환
    .replace(/&nbsp;|&#x20;|&x20;/gi, " ") // HTML 공백 엔티티 변환 방지
    .trim(); // 앞뒤 공백 제거

  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
