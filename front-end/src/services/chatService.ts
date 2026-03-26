import { httpClient } from "../utils/httpClient";
import type { ChatBotResponse } from "../types/ChatBot";

export const chatService = {
  async sendMessage(message: string): Promise<ChatBotResponse> {
    try {
      const response = await httpClient.post<ChatBotResponse>("/chat/ai-search", {
        message,
      });
      return response.data;
    } catch (error: any) {
      console.error("Chat service error:", error);
      throw error;
    }
  },
};

