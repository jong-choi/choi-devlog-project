import { getTodosByUserId } from "@/app/(example)/example/[userId]/actions";
import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

interface TodoListFetchProps {
  userId: string;
}

export default async function TodoListFetch({ userId }: TodoListFetchProps) {
  // 데이터를 캐싱할 때 관리할 태그명을 지정한다.
  const cacheTag = `todosByServerAction-${userId}`;

  // () => 캐싱된 데이터를 revalidateTag로 revalidate하는 함수
  async function buttonAction() {
    "use server";
    revalidateTag(cacheTag);
  }

  // Server Action로 받아온 데이터를 캐싱하는 `unstable_cache` 래퍼
  const cachedFetchTodos = unstable_cache(
    getTodosByUserId, // 데이터를 받아올 Fetcher 함수
    [`todos-${userId}`], // cache된 데이터를 관리할 고유한 key의 배열
    {
      revalidate: 10000000,
      tags: [cacheTag],
    } // option 객체
  );

  // cookies()를 외부에서 실행시켜 cookieStore로 만든다.
  const cookieStore = await cookies();
  // cachedFetchTodos에 userId와 cookieStore를 인자로 넘겨 Server Action을 실행시켜 데이터를 받는다.
  const todos = await cachedFetchTodos(userId, cookieStore);

  if (!todos) return <div>할 일이 없습니다.</div>;

  return (
    <div>
      {/* 컴포넌트 설명 */}
      <h1>&quot;Server Action&quot;을 이용하여 데이터를 캐싱하기</h1>
      {/* 새로고침 버튼 */}
      <form>
        <button formAction={buttonAction} type="submit">
          Server Action으로 불러온 리스트 새로고침하기
        </button>
      </form>
      {/* TodoList목록 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
    </div>
  );
}
