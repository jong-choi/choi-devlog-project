import { LangNodeKeys } from "@/app/api/chat/_controllers/types/chat";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";
import { HumanMessage } from "@langchain/core/messages";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function handleSend(request: NextRequest, sessionId: string) {
  try {
    const body = (await request.json()) as {
      message: string;
      type: LangNodeKeys;
    };

    if (!body) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const routeType = body.type || "chat";
    sessionStore.set({
      id: sessionId,
      state: {
        messages: [new HumanMessage(body.message)],
        routeType,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: randomUUID(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
