
import { GoogleGenAI } from "@google/genai";
import { AIPreset } from '../types';

const API_KEY = process.env.API_KEY || '';

export const enhanceImage = async (base64Image: string, preset: AIPreset = AIPreset.GLOW): Promise<string> => {
  if (!API_KEY) {
    console.warn("No API Key found for Gemini. Skipping enhancement.");
    throw new Error("API Key not configured");
  }

  if (preset === AIPreset.NONE) return base64Image;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const model = 'gemini-1.5-flash';
    
    // Base instruction for ALL presets to ensure face preservation
    const preservationInstruction = "CRITICAL: You must strictly preserve the original person's facial structure, identity, and features. Do not morph the face, do not change the eye shape, nose shape, or jawline. Only apply the style/lighting/color effects.";

    let prompt = `${preservationInstruction} Enhance this photo to look like a high-quality professional portrait. Soften the lighting, smooth the skin slightly. Return ONLY the image.`;

    switch (preset) {
      case AIPreset.GLOW:
        prompt = `${preservationInstruction} Apply a soft, angelic glow filter to this image. Pastel colors, dreamy ethereal lighting, soft focus, slight bloom effect. High quality aesthetic. Return ONLY the image.`;
        break;
      case AIPreset.BOLLYWOOD:
        prompt = `${preservationInstruction} Transform this into a 1990s Bollywood movie style still. Warm hazy lighting, vibrant chiffon colors, soft film grain, vintage romance aesthetic. Return ONLY the image.`;
        break;
      case AIPreset.RETRO_ANIME:
        prompt = `${preservationInstruction} Convert this image into a 90s retro anime style. Cel shaded, soft pastel colors, lo-fi aesthetic, nostalgic vibe. Keep the person recognizable. Return ONLY the image.`;
        break;
      case AIPreset.VINTAGE_NOIR:
        prompt = `${preservationInstruction} Apply a classic 1940s Hollywood Film Noir style. High contrast black and white, dramatic shadows, silver screen aesthetic, soft grain. Return ONLY the image.`;
        break;
      case AIPreset.CYBER:
        prompt = `${preservationInstruction} Apply a soft vaporwave cyber aesthetic. Neon pink and purple hues, soft lighting, futuristic but retro vibe. Return ONLY the image.`;
        break;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
         }
       }
    }

    throw new Error("No image data returned from AI");

  } catch (error) {
    console.error("AI Enhancement failed:", error);
    throw error;
  }
};
