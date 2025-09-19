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

    // This text part is crucial. It tells the model what to DO with the image.
    const textPart = {
      text: "Extract structured data from the image based on the provided instructions."
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // A multimodal prompt requires both the image and the text instruction.
      contents: { parts: [imagePart, textPart] },
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

    // A simple guard to ensure the response is a JSON string before parsing
    if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
      console.error("Received non-JSON response from API:", jsonString);
      throw new Error("The API did not return a valid JSON format. Please check your prompt and the image content.");
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