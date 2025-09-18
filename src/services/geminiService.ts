import { GoogleGenAI } from "@google/genai";

export async function extractDataFromImage(apiKey: string, base64Image: string, mimeType: string, customPrompt: string): Promise<Record<string, string | null>> {
  if (!apiKey) {
    throw new Error("Gemini API Key is not provided.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart] },
      config: {
        systemInstruction: customPrompt,
        responseMimeType: "application/json",
        // Note: responseSchema is omitted to allow the model flexibility with `null` values,
        // as the schema does not explicitly support a STRING | NULL union type.
        // The detailed prompt is expected to be sufficient for enforcing the JSON structure.
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("The API returned an empty response. The image might be unclear or contain no text.");
    }

    const parsedJson = JSON.parse(jsonString);
    return parsedJson as Record<string, string | null>;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("The provided Gemini API Key is not valid. Please check it and try again.");
        }
        if (error.message.includes("429")) {
            throw new Error("API rate limit exceeded. Please wait and try again.");
        }
    }
    throw new Error("Failed to extract data from image. Please check the console for details.");
  }
}