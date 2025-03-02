interface TodoListFetchProps {
  userId: string;
}

export default function TodoListFetch({ userId }: TodoListFetchProps) {
  return <div>{userId}</div>;
}
