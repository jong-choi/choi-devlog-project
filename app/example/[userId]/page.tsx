import TodoAdder from "@/components/example/TodoAdder";
import TodoListCached from "@/components/example/TodoListCached";
import TodoListFetch from "@/components/example/TodoListFetch";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;
  return (
    <div>
      <TodoAdder />
      <TodoListCached userId={userId} />
      <TodoListFetch userId={userId} />
    </div>
  );
}
