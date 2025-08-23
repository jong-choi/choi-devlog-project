import SSEChatbotController from "../_controllers/controller";

const controller = new SSEChatbotController();

export async function POST() {
  return controller.createSession();
}

export const dynamic = "force-dynamic";
