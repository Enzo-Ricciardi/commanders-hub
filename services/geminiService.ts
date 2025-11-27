import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (systemInstruction: string): Chat => {
  const apiKey = process.env.API_KEY;
  console.log("[GeminiService] Creating chat session. API Key present:", !!apiKey);
  if (!apiKey) {
    console.error("[GeminiService] API Key is missing!");
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};

export const streamChatResponse = async (chat: Chat, prompt: string, onChunk: (text: string) => void): Promise<void> => {
  const response = await chat.sendMessageStream({ message: prompt });
  for await (const chunk of response) {
    onChunk(chunk.text);
  }
};

export const getLatestNews = async (query: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Unknown Source'
      }))
      .filter((source: GroundingSource) => source.uri);

    return { text, sources };
  } catch (error) {
    console.error("Error fetching latest news:", error);
    return { text: "Failed to retrieve the latest GalNet transmissions. There might be a temporary network issue.", sources: [] };
  }
};

export const analyzeWithAI = async (prompt: string, useProModel: boolean = false): Promise<string> => {
  try {
    const model = useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = useProModel ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });
    return response.text;
  } catch (error) {
    console.error(`Error analyzing with ${useProModel ? 'Pro' : 'Flash'} model:`, error);
    return "An error occurred during AI analysis. Please try again.";
  }
};

export const generateExplorationLog = async (logPrompt: string, imagePrompt: string): Promise<{ log: string, imageUrl: string }> => {
  try {
    const logPromise = ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: logPrompt,
      config: { thinkingConfig: { thinkingBudget: 8192 } }
    });

    const imagePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const [logResponse, imageResponse] = await Promise.all([logPromise, imagePromise]);

    const log = logResponse.text;
    let imageUrl = '';

    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        break;
      }
    }

    if (!imageUrl) {
      console.error("No image data found in Gemini response");
    }

    return { log, imageUrl };

  } catch (error) {
    console.error("Error generating exploration log:", error);
    return { log: "Failed to compile the log entry. Sensor data might be corrupted.", imageUrl: "" };
  }
};