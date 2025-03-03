import Link from "next/link";

// app/auth/auth-code-error/page.tsx (로그인 에러 페이지)
export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const errorMessage =
    (await searchParams)?.message || "로그인 중 문제가 발생했습니다.";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-500">인증 오류 발생</h1>
      <p className="text-gray-600 mt-2">{errorMessage}</p>
      <Link
        href="/auth/login"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        로그인 다시 시도하기
      </Link>
    </div>
  );
}
