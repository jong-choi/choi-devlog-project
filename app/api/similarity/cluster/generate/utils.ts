import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  embedClusterText,
  type EmbeddingGemmaPreset,
} from "@/lib/ai/embedding-gemma";
import { mediumModel } from "@/app/api/chat/_controllers/utils/model";

export async function generateClusterTitleAndSummary(
  summaries: string[],
  preset: EmbeddingGemmaPreset = "search_document",
) {
  const prompt = `
당신은 요약가입니다.
다음은 같은 주제를 다루는 여러 블로그 글들의 요약입니다.  

각 요약은 서로 다른 글에서 발췌되었지만, 하나의 주제를 공유하고 있습니다.  
이 글들의 공통된 주제를 파악해서, 다음 두 가지를 생성해 주세요:

1. **군집의 제목 (title)**: 한국어로 최대 3단어로 간결하게, 이 글들의 주제를 잘 나타내는 짧은 제목을 만들어 주세요.  
2. **대표 요약문 (summary)**: 한국어로 이 글들의 내용을 요약한 대표 문장을 작성해주세요.  
    - 한 문장으로 작성  
    - 객관적이고 중립적인 어조  
    - 핵심 키워드 포함  
    - 벡터화(embedding)에 적합하도록 작성  
    - 감성적 수사 없이 정보 중심
3. **대표 단어들 (keywords)**: 이 글들에 등장한 내용들에서 중요한 키워드들을 추출해주세요. 영어 소문자로, 특수기호가 없이.

---

요약 목록:
${summaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;

  const obj = {
    title: "PWA 개발",
    summary:
      "이 군집은 Next.js와 Firebase를 활용한 PWA 웹앱 개발 과정을 다룹니다.",
    keywords: ["pwa", "next js", "firebase", "quiz"],
  };

  let parsedGptRes = {
    title: "",
    summary: "",
    keywords: [""],
  };

  let retry = 0;

  //gpt가 답변을 이상하게 한 경우 3번 재시도
  while (retry <= 3) {
    retry++;
    if (retry >= 3) {
      return {
        title: "",
        summary: "",
        keywords: [""],
        vector: [],
      };
    }

    const completion = await mediumModel.invoke([
      new SystemMessage(
        "당신은 글들을 주제로 군집화하고, 군집의 대표 제목과 요약문을 만드는 요약가입니다. 최종 응답은 JSON 객체 raw text만 반환하세요. 코드펜스, 설명, 서두, 마크다운을 포함하지 마세요. 형식 예시는 다음과 같습니다: " +
          JSON.stringify(obj),
      ),
      new HumanMessage(prompt),
    ]);

    const gptRes = completion.text.trim();

    try {
      parsedGptRes = JSON.parse(gptRes) as {
        title: string;
        summary: string;
        keywords: string[];
      };

      if (
        typeof parsedGptRes.title === "string" &&
        typeof parsedGptRes.summary === "string" &&
        Array.isArray(parsedGptRes.keywords)
      ) {
        break;
      }
    } catch (_e) {
      console.error(`CHATGPT-TO-JSON 파싱 실패:`, gptRes);
    }
  }

  const result: {
    title: string;
    summary: string;
    keywords: string[];
    vector: number[];
  } = {
    ...parsedGptRes,
    vector: [],
  };

  if (parsedGptRes.summary) {
    result.vector = await embedClusterText({
      summary: parsedGptRes.summary,
      keywords: parsedGptRes.keywords,
    }, preset);
    if (!result.vector || !result.vector.length) {
      console.error(`벡터 생성 실패`, result);
    }
  }

  return result;
}
