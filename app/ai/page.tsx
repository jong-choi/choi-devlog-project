"use client";

import { postDummyDataString } from "@/app/post/[urlSlug]/dummy-data";
import { Database } from "@/types/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Button } from "@ui/button";
import { useState } from "react";

const Page: React.FC = () => {
  const [res, setRes] = useState({ summary: "", vector: "" });

  const supabaseRes: PostgrestSingleResponse<
    Database["public"]["Tables"]["posts"]["Row"]
  > = JSON.parse(postDummyDataString);

  const { title, body } = supabaseRes.data!;

  const onClick = async () => {
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: body || "" }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("요약 생성 실패:", data.error);
        return;
      }

      setRes(data); // ✅ { summary, vector } 객체 전체를 저장
    } catch (error) {
      console.error("API 호출 오류:", error);
    }
  };

  return (
    <div>
      <Button onClick={onClick}>불러오기</Button>
      <div>요약 :{res.summary}</div>
      <div>벡터 :{res.vector}</div>
      <div>{JSON.stringify(res)}</div>
    </div>
  );
};

export default Page;
