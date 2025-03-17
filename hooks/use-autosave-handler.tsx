// "use client";

// import { useAutosave } from "@/providers/autosave-store-provider";
// import { useDebounce } from "@/hooks/use-debounce";

// /**
//  * 게시글 데이터를 자동 저장하는 핸들러 함수.
//  * 주어진 `title`과 `body` 값을 디바운싱한 후 상태를 업데이트하여 자동 저장을 트리거한다.
//  *
//  * @param {Object} params - 자동 저장할 데이터
//  * @param {string} params.postId - 게시글의 고유 ID
//  * @param {string} params.title - 게시글 제목
//  * @param {string} params.body - 게시글 본문
//  *
//  * @example
//  * ```tsx
//  * useAutosaveHandler({ postId: "123", title: "새 제목", body: "새 본문" });
//  * ```
//  */
// export const useAutosaveHandler = ({
//   postId,
//   title,
//   body,
// }: {
//   postId: string;
//   title: string;
//   body: string;
// }) => {
//   const { setIsAutoSaving, setRecentAutoSavedData } = useAutosave((state) => ({
//     setIsAutoSaving: state.setIsAutoSaving,
//     setRecentAutoSavedData: state.setRecentAutoSavedData,
//   }));

//   const debouncedTitle = useDebounce(title, 50000);
//   const debouncedBody = useDebounce(body, 50000);

//   if (debouncedTitle || debouncedBody) {
//     setIsAutoSaving(true);
//     setRecentAutoSavedData({
//       postId,
//       data: {
//         timestamp: Date.now(),
//         title: debouncedTitle,
//         body: debouncedBody,
//       },
//     });
//   }
// };
