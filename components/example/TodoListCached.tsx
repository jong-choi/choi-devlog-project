interface TodoListCachedProps {
  userId: string;
}

export default function TodoListCached({ userId }: TodoListCachedProps) {
  return <div>{userId}</div>;
}
