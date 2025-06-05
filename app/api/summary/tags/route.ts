import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { summaryParser } from "@/utils/api/analysis-utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const user = await supabase.auth.getUser();
  if (!user.data) {
    console.error("로그인되지 않은 사용자:");
    return NextResponse.json(
      { error: "사용자 정보 불러오기 실패" },
      { status: 500 }
    );
  }
  try {
    const { id, summary, post_id } = (await req.json()) ?? {};
    const failedPosts: string[] = [];
    const skippedPosts: string[] = [];
    let successCount = 0;
    let summaries: { id: string; summary: string; post_id: string }[] | null =
      [];
    let loadError = null;

    if (summary && post_id) {
      summaries = [{ id, summary, post_id }];
    } else {
      const { data, error } = await supabase
        .from("ai_summaries")
        .select("id, summary, post_id")
        .is("deleted_at", null)
        // @ts-expect-error : 임시로 null
        .neq("summary", null);
      // @ts-expect-error : 임시로 null
      summaries = data;
      loadError = error;
    }

    if (loadError) {
      console.error("summary 로딩 실패:", loadError);
      return NextResponse.json({ error: "summary 로딩 실패" }, { status: 500 });
    }

    if (!summaries || summaries.length === 0) {
      return NextResponse.json({ message: "처리할 summary가 없습니다." });
    }

    for (const s of summaries) {
      if (!s.summary || !s.post_id) {
        skippedPosts.push(s.id);
        continue;
      }

      let tags: string[] = [];

      try {
        // 2. GPT 호출
        const prompt = `
        다음 글의 요약을 기반으로 핵심 기술 스택 또는 주제를 
        2개에서 5개 정도의 **짧은 키워드(tag)** 로 뽑아줘.
        중요한 태그가 없는 경우 2개 정도만, 중요한 태그가 많은 경우 5개 정도 태그를 반환해줘.
        해당 요약이 사이드 프로젝트, 토이 프로젝트에 관한 태그인 경우 가장 앞에 "Project"라는 태그를 삽입해줘.
        
        ❗형식은 반드시 JSON 배열로:
        예: ["Project", "React", "Vue.js", "Angular", "Svelte", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "jQuery", "Bootstrap", "Webpack", "ESLint", "Prettier", "Storybook", "Framer Motion"]
        
        🔽 아래 조건을 반드시 지켜줘:
        - 각 태그는 1~2단어로, 간결하게 (예: "Next.js", "Styled Components")
        - 고유명사/기술명은 영어가 있는 경우 변환 (예: "서버사이드 렌더링"=>"CSR", 자바스크립트 => "JavaScript")
        - 의미가 겹치지 않게 중복 제거
        - 문장이나 설명, 제목 형태 ❌
        
        요약:
        ${summaryParser(s.summary)}
        `;
        const completion = await openai.chat.completions.create({
          model: "chatgpt-4o-latest",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        });

        const rawText = completion.choices[0].message.content ?? "[]";
        console.log("GPT 응답:", rawText);

        try {
          tags = JSON.parse(rawText);
        } catch (_e) {
          console.error(`[${s.post_id}] 태그 파싱 실패:`, rawText);
          failedPosts.push(s.post_id);
          continue;
        }

        if (!Array.isArray(tags)) {
          console.error(`[${s.post_id}] GPT 응답 형식이 배열이 아님:`, rawText);
          failedPosts.push(s.post_id);
          continue;
        }
      } catch (gptError) {
        console.error(`[${s.post_id}] GPT 호출 실패:`, gptError);
        failedPosts.push(s.post_id);
        continue;
      }

      for (const tagName of tags) {
        if (typeof tagName !== "string" || tagName.length === 0) continue;

        let tagId: string | undefined;

        // 3. 태그 존재 여부 확인
        const { data: existingTag, error: findError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        if (findError && findError.code !== "PGRST116") {
          console.error(
            `[${s.post_id}] 태그 검색 에러 (${tagName}):`,
            findError
          );
          continue;
        }

        tagId = existingTag?.id;

        // 4. 없으면 생성
        if (!tagId) {
          const { data: newTag, error: insertError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single();

          if (insertError) {
            console.error(
              `[${s.post_id}] 태그 생성 실패 (${tagName}):`,
              insertError
            );
            continue;
          }

          tagId = newTag?.id;
        }

        if (!tagId) continue;

        // 5. post_tags 연결
        const { error: linkError } = await supabase
          .from("post_tags")
          .upsert(
            { post_id: s.post_id, tag_id: tagId },
            { onConflict: "post_id,tag_id" }
          );

        if (linkError) {
          console.error(
            `[${s.post_id}] post_tags 연결 실패 (${tagName}):`,
            linkError
          );
        }
      }

      successCount++;
    }

    return NextResponse.json({
      message: "태그 생성 처리 완료",
      success: successCount,
      failed: failedPosts.length,
      skipped: skippedPosts.length,
      failedPosts,
      skippedPosts,
    });
  } catch (err) {
    console.error("[TAG GENERATION - FATAL ERROR]", err);
    return NextResponse.json({ error: "서버 내부 오류 발생" }, { status: 500 });
  }
}
