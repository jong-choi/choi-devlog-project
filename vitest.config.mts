import { defineConfig } from "vitest/config"; // Vitest에서 설정을 정의하는 함수.
import react from "@vitejs/plugin-react"; // Vite에서 React를 사용할 수 있도록 해주는 플러그인.
import tsconfigPaths from "vite-tsconfig-paths"; // tsconfig.json의 paths 옵션을 지원하도록 해주는 플러그인.

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    /*
     * 테스트 환경을 jsdom으로 설정
     * jsdom은 브라우저 환경을 흉내 내는 가상 DOM 라이브러리
     * React 컴포넌트 테스트 시 DOM API를 사용할 수 있도록 함
     */
    setupFiles: ["dotenv/config"],
    /*
     * setupFiles 목록에 dotenv/config를 추가한다.
     * dotenv.config()는 .env파일을 읽고 process.env에 등록하는 역할을 한다.
     * 결과적으로 .env 파일들이 jsdom에 등록된다.
     */
  },
});
