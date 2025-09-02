import { Metadata } from "next";
import AdminPage from "@/components/admin/admin-page";

export const metadata: Metadata = {
  title: "AI 관리자 도구 - Choi Devlog",
  description:
    "AI 요약 생성, 추천 게시글 생성 및 조회를 위한 관리자 전용 도구입니다.",
};

export default function AdminPageRoute() {
  return <AdminPage />;
}
