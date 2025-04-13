"use client";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function SidabarDropdownApp({
  setUpdateOpen,
  setDeleteOpen,
}: {
  setUpdateOpen: () => void;
  setDeleteOpen: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex-1 max-w-4 p-0 -mr-2 text-color-muted hover:bg-glass-bg-60"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="-mt-2">
        <DropdownMenuItem className="cursor-pointer" onClick={setUpdateOpen}>
          수정
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={setDeleteOpen}>
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
