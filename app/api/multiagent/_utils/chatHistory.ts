import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export class ChatMessageHistoryWithDeletion {
  private messages: BaseMessage[] = [];

  async getMessages(): Promise<BaseMessage[]> {
    return [...this.messages];
  }

  async addMessage(message: BaseMessage): Promise<void> {
    this.messages.push(message);
  }

  async addUserMessage(message: string): Promise<void> {
    const userMessage = new HumanMessage(message);
    await this.addMessage(userMessage);
  }

  async addAIMessage(message: string): Promise<void> {
    const aiMessage = new AIMessage(message);
    await this.addMessage(aiMessage);
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  async deleteMessages(): Promise<void> {
    await this.clear();
  }

  get length(): number {
    return this.messages.length;
  }
}