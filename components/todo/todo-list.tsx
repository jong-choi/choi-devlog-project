import {
  createRevalidationTagFactory,
  getTodosByUserId,
} from "@/app/example/[userId]/actions";
import { TodoItem } from "@/components/todo/todo-item";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

export const TodoList: React.FC = async () => {
  // supabase 클라이언트에서 user정보를 가져온다.
  const supabase = await createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id || "";

  // 데이터를 캐싱할 때 관리할 태그명을 생성한다.
  const { todoListByUserId: cacheTag } = await createRevalidationTagFactory({
    userId,
  });

  // Server Action로 받아온 데이터를 캐싱하는 `unstable_cache` 래퍼
  const cachedFetchTodos = unstable_cache(
    getTodosByUserId,
    [cacheTag], // cache를 관리하는 고유한 key
    {
      revalidate: 10000000,
      tags: [cacheTag], // cache를 revalidate 할 때 사용하는 태그
    }
  );

  // cookies()를 외부에서 실행시켜 cookieStore로 만든 후, userId와 cookieStore를 함께 전달하여 데이터를 가져온다.
  const cookieStore = await cookies();
  const todos = await cachedFetchTodos(userId, cookieStore);

  return (
    <div className="flex flex-col gap-4 mt-10 pt-10">
      {!todos?.length ? (
        <div>할 일이 없습니다.</div>
      ) : (
        todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
      )}
    </div>
  );
};
