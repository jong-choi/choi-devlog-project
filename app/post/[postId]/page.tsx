interface PageProps {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { postId } = await params;
  const _searchParams = await searchParams;

  return (
    <div>
      <h1>Page Component</h1>
      {postId}
    </div>
  );
}
