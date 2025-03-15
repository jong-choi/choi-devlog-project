## Markdown Editor 구현 내용

### MarkdownEditor 컴포넌트

MarkdownEditor 컴포넌트는 "@mdxeditor/editor"를 다이나믹 import 하는 서버 컴포넌트이다.  
"@mdxeditor/editor"는 일부 플러그인이 SSR와 충돌을 일으켜 `{SSR : False}` 옵션을 준 채 동적으로 import 해야한다.

이때 서버 측 렌더링을 위해 선택한 라이브러리가 "react-markdown"이다. "react-markdown"는 remark와 rehype를 사용하기 위한 최소한만 설치되어 있어 서버 측 렌더링에서 별다른 충돌을 일으키지 않는다.

따라서 dynamic import 시, "react-markdown"과 remark의 plugin로 구성한 컴포넌트를 SSR 하여 이를 Loading 컴포넌트로 두고,  
"@mdxeditor/editor"는 클라이언트 측에 마운트 되면 hydrate 한다.

### react-markdown

`react-markdown-wrapper.tsx`는 react-markdown을 불러와 렌더링한다.

이때 `@mdxeditor/editor`의 툴바과 디자인을 맞추기 위해 상단에 스켈레톤을 넣었다.

그 밖의 플러그인들은 아래와 같다.

`remarkGfm` → GitHub Flavored Markdown(GFM) 지원 (테이블, 체크박스, 스트라이크스루 등).

`remarkParse` → Markdown을 파싱하여 AST(Abstract Syntax Tree)로 변환.

`remarkBreaks` → Markdown에서 단순 줄바꿈(\n)을 <br> 태그로 변환.

`rehypeHighlight` → 코드 블록에 구문 강조(Syntax Highlighting) 적용.

rehypeHighlight는 객체에 접근하지 않아도 적용이 되어 SSR이 가능하다.

### @mdxeditor/editor

`@mdxeditor/editor`는 github 페이지에 있는 보일러 플레이트를 가져왔다.  
`@mdxeditor/editor`에 있는 모든 플러그인(코드샌드박스연동 제외)을 모두 적용했다.
