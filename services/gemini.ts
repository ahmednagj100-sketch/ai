
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

export const createGeminiChat = () => {
  // Always fetch a fresh API_KEY from the environment to ensure it's up to date after selection
  const API_KEY = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Using gemini-3-pro-preview for high-quality responses.
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are Pulse, a world-class AI assistant. 
      Your responses should be insightful, accurate, and formatted using Markdown. 
      When providing code, always specify the language for syntax highlighting.
      Maintain a helpful and professional tone.`,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      // Enhanced reasoning for Gemini 3 Pro
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};

export const streamChatResponse = async (
  chat: any, 
  message: string, 
  onChunk: (text: string) => void
) => {
  try {
    const result = await chat.sendMessageStream({ message });
    let fullText = "";
    
    for await (const chunk of result) {
      const chunkText = (chunk as GenerateContentResponse).text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    
    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error; // Let the caller handle UI state for specific error codes
  }
};
