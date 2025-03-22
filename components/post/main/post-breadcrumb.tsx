"use client";
import { Category, Subcategory } from "@/types/post";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ui/breadcrumb";

export default function PostBreadcrumb({
  category,
  subcategory,
  title,
}: {
  category: Category | null;
  subcategory: Subcategory | null;
  title?: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block cursor-default select-none">
          {category?.name || "카테고리명"}
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="hidden md:block cursor-default select-none">
          {subcategory?.name || "서브카테고리명"}
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="cursor-default select-none">
          <BreadcrumbPage>{title || "새 글"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
