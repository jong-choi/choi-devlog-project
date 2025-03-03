import { Database } from "@/types/supabase";
import { revalidateTag } from "next/cache";

interface TodoListFetchProps {
  userId: string;
}

type Todo = Database["public"]["Tables"]["todos_with_rls"]["Row"];

export default async function TodoListFetch({ userId }: TodoListFetchProps) {
  // 데이터를 캐싱할 때 관리할 태그명을 지정한다.
  const cacheTag = `todosByFetch-${userId}`;

  // () => 캐싱된 데이터를 revalidateTag로 revalidate하는 함수
  async function buttonAction() {
    "use server";
    revalidateTag(cacheTag);
  }

  // fetch를 통해 데이터를 불러온다.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/todos?userId=${userId}`,
    {
      next: { revalidate: 10000000, tags: [cacheTag] }, // 장기간 캐싱 (revalidateTag로 갱신)
    }
  );

  // 데이터를 파싱한다.
  const todos: Todo[] = await res.json();

  return (
    <div>
      {/* 컴포넌트 설명 */}
      <h1>&quot;확장된 Fetch&quot;를 이용하여 데이터를 캐싱하기</h1>
      {/* 새로고침 버튼 */}
      <form>
        <button formAction={buttonAction} type="submit">
          Fetch로 불러온 리스트 새로고침하기
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
