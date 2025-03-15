"use client";
import { postDummyDataString } from "@/app/dashboard/dummyData";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Separator } from "@radix-ui/react-separator";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ui/breadcrumb";
import { Button } from "@ui/button";
import { PanelLeftIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import "@mdxeditor/editor/style.css";
// import dynamic from "next/dynamic";

export default function Page() {
  const result: PostgrestSingleResponse<
    Database["public"]["Tables"]["posts"]["Row"]
  > = JSON.parse(postDummyDataString);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data } = result;

  return (
    <div className="bg-gray-200 w-full h-full">
      <main className="p-2">
        <MainContainer className="bg-white">
          <header
            data-component-name="main-header"
            className="flex h-16 shrink-0 items-center gap-2"
          >
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">카테고리명</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">서브카테고리</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>제목</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <section
            data-component-name="main-post-section"
            className="flex flex-1 flex-col gap-4 p-4 md:px-8 pt-0"
          >
            <h2
              data-component-name="main-post-title"
              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
            >
              <EditableDiv defaultValue="The People of the Kingdom" />
            </h2>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </section>
        </MainContainer>
      </main>
    </div>
  );
}

/**
 * 사용자가 직접 편집할 수 있는 div 요소
 * @param {string} defaultValue - 초기 텍스트 값
 * @param {(value: string) => void} onInput - 입력값이 변경될 때 호출되는 콜백 함수
 * @param {boolean} isEditable - 수정 가능 여부
 */
export const EditableDiv: React.FC<{
  defaultValue?: string;
  onInput?: (value: string) => void;
  isEditable?: boolean;
}> = ({ defaultValue = "", onInput, isEditable = true }) => {
  const ref = useRef<HTMLDivElement>(null);

  /** 입력 이벤트 핸들러 */
  const handleInput = () => {
    const newValue = ref.current?.innerText || "";
    onInput?.(newValue);
  };

  /** defaultValue 변경 시 div 내용 업데이트 */
  useEffect(() => {
    if (ref.current) {
      ref.current.innerText = defaultValue;
    }
  }, [defaultValue]);

  return (
    <div
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning
      className="h-full w-full break-words whitespace-pre-wrap focus:outline-offset-8 focus:outline-dotted"
      onInput={handleInput}
    />
  );
};

function MainContainer({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:rounded-xl md:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
