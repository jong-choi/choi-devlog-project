import { Command } from "@langchain/langgraph";
import { getAISummaryByPostId } from "@/app/post/fetchers/ai";
import { LangNodeName } from "@/types/chat";
import { SessionMessagesAnnotation } from "./graph";

// 게시글 요약문을 업데이트함
export async function fetchSummaryNode(
  state: typeof SessionMessagesAnnotation.State,
) {
  console.log("Fetch summary node - postId:", state.postId); //디버깅
  const nextState: Partial<typeof state> = {
    ...state,
    postSummary: null,
  };
  if (!state.postId) {
    console.log("No postId, returning to routing"); //디버깅
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  try {
    console.log("Fetching AI summary for postId:", state.postId); //디버깅
    const res = await getAISummaryByPostId(state.postId);
    const data = res.data;
    if (data) {
      const { post_id, summary } = data;
      console.log("Summary fetched successfully"); //디버깅
      nextState.postSummary = {
        id: post_id || state.postId,
        summary,
      };
    } else {
      console.log("No summary data found"); //디버깅
    }

    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  } catch (e) {
    console.error("Fetch summary error:", e); //디버깅
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }
}
