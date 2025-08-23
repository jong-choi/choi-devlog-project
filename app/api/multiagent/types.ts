export type RequestType = "search" | "summary" | "chat";

export interface RequestContext {
  type: RequestType;
  keyword?: string;
  post_id?: string;
  postId?: string;
}

export interface MultiAgentRequest {
  message: string;
  // 신형: 컨텍스트 기반 요청
  context?: RequestContext;
  // 구형 호환: 루트에 직접 전달되던 필드들
  type?: RequestType;
  post_id?: string;
  // 세션 메모리용 스레드 ID
  sessionId?: string;
}

export interface SearchApiResponse {
  data?: Array<{
    title: string;
    url_slug: string;
    snippet?: string;
    description?: string;
    created_at: string;
    category_name: string;
    subcategory_name: string;
  }>;
  error?: any;
}

export interface SummaryApiResponse {
  data?: {
    summary: string;
    tags?: string[];
    key_points?: string[];
    created_at: string;
  };
  error?: any;
}
