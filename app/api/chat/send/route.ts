import SSEChatbotController from "../_controllers/controller";
import type { NextRequest } from "next/server";

const controller = new SSEChatbotController();

export async function POST(request: NextRequest) {
  return controller.sendMessage(request);
}

export const dynamic = "force-dynamic";
