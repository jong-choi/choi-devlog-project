"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function ToggleEditButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEditMode = searchParams.get("edit") === "true";

  const toggleEditMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isEditMode) {
      params.delete("edit");
    } else {
      params.set("edit", "true");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      onClick={toggleEditMode}
      className="px-4 py-2 rounded bg-blue-600 text-white"
    >
      {isEditMode ? "미리보기" : "수정하기"}
    </button>
  );
}
