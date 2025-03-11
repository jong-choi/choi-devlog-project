"use server";

import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const createRevalidationTagFactory = async ({
  userId,
}: {
  userId?: string;
}) => ({
  get todoListByUserId() {
    return `todoList:userId:${userId}`;
  },
});

export const revalidateTodoListByUserId = async (supabase: SupabaseClient) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const tagFactory = await createRevalidationTagFactory({ userId });
  const tag = tagFactory.todoListByUserId;
  revalidateTag(tag);
};

// todoList 가져오기
export const getTodos = async () => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .order("id", {
      ascending: false,
    });

  return result.data;
};

// todoList 가져오기 + by Id
export const getTodosById = async (id: number) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .eq("id", id);

  return result.data;
};

// todoList 가져오기 + by UserId
export const getTodosByUserId = async (
  userId: string,
  cookieStore?: ReadonlyRequestCookies
): Promise<Array<
  Database["public"]["Tables"]["todos_with_rls"]["Row"]
> | null> => {
  const supabase = await createClient(cookieStore);
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return result.data;
};

// todoList 가져오기 + search
export const getTodosBySearch = async (terms: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .select("*")
    .is("deleted_at", null)
    .ilike("content", `%${terms}%`)
    .order("id", { ascending: false })
    .limit(500);

  return result.data;
};

// todoList 생성하기
export const createTodos = async (
  content: string
): Promise<Array<
  Database["public"]["Tables"]["todos_with_rls"]["Insert"]
> | null> => {
  const supabase = await createClient();

  const result = await supabase
    .from("todos_with_rls")
    .insert({
      content,
    })
    .select();

  await revalidateTodoListByUserId(supabase);
  return result.data;
};

// todoList 업데이트 하기
export const updateTodos = async (id: number, content: string) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  await revalidateTodoListByUserId(supabase);

  return result.data;
};

// todoList softDelete
export const deleteTodosSoft = async (id: number) => {
  const supabase = await createClient();
  const result = await supabase
    .from("todos_with_rls")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  await revalidateTodoListByUserId(supabase);

  return result.data;
};
