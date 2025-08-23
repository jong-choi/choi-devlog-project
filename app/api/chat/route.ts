import SSEChatbotController from "./_controllers/controller";

const _controller = new SSEChatbotController();

export async function GET() {
  return new Response(
    JSON.stringify({
      endpoints: [
        { method: "POST", path: "/api/chat/session" },
        { method: "GET", path: "/api/chat/stream?sessionId={id}" },
        { method: "POST", path: "/api/chat/send" },
        { method: "POST", path: "/api/chat/clear" },
      ],
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

export const dynamic = "force-dynamic";
