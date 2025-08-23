import SSEChatbotController from "../_controllers/controller";
import type { NextRequest } from "next/server";

const controller = new SSEChatbotController();

export async function GET(request: NextRequest) {
  return controller.openStream(request);
}

export const dynamic = "force-dynamic";
