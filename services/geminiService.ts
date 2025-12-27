
import { GoogleGenAI, Type } from "@google/genai";
import { SCPFile, ObjectClass } from "../types";

// Always use the process.env.API_KEY string directly when initializing the GoogleGenAI client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const scpModel = 'gemini-3-flash-preview';

export const generateSCPReport = async (itemNumber: string): Promise<Partial<SCPFile>> => {
  const prompt = `
    Создай вымышленную запись в базе данных Фонда SCP для Объекта №: SCP-${itemNumber}.
    Ответ должен быть валидным JSON-объектом.
    Язык содержания: Русский.
    
    Запись должна be креативной, написанной в клиническом стиле и следовать стандартному формату SCP.
    
    Обязательные поля:
    - objectClass: Одно из "SAFE", "EUCLID", "KETER", "THAUMIEL".
    - containmentProcedures: Параграф, описывающий особые условия содержания (ОУС).
    - description: Детальное описание аномалии. 2-3 параграфа.
    
    Убедись, что тон холодный, научный и бюрократический.
  `;

  try {
    const response = await ai.models.generateContent({
      model: scpModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objectClass: { type: Type.STRING, enum: ["SAFE", "EUCLID", "KETER", "THAUMIEL"] },
            containmentProcedures: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["objectClass", "containmentProcedures", "description"]
        }
      }
    });

    // The text property is a getter, do not call as a method.
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text.trim());

    return {
      itemNumber: `SCP-${itemNumber}`,
      objectClass: data.objectClass as ObjectClass,
      containmentProcedures: data.containmentProcedures,
      description: data.description,
      isRedacted: false,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const commandChatStream = async function* (history: { role: string, parts: { text: string }[] }[], newMessage: string) {
    const chat = ai.chats.create({
      model: scpModel,
      history: history,
      config: {
        systemInstruction: `
          Ты — ИИ Мейнфрейма SCPNET. 
          Твоя роль — помогать персоналу Фонда. 
          Отвечай на Русском языке.
          Твой тон эффективный, слегка роботизированный, но полезный.
          У тебя есть доступ к данным 4-го уровня.
          Если спросят о Совете О5, отвечай, что информация засекречена.
          Держи ответы краткими и отформатированными для терминального интерфейса.
        `,
      }
    });
  
    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
      // Access chunk.text directly (property getter).
      yield chunk.text;
    }
  };
