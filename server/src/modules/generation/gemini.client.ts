import {
  GoogleGenAI,
  Modality,
  createPartFromBase64,
  type Content,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

type GeminiClientLike = {
  models: {
    generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
  };
};

export type GeminiImageInput = {
  prompt: string;
  carBytes: Buffer;
  carMimeType: string;
  wrapBytes: Buffer;
  wrapMimeType: string;
};

export type GeminiImageClient = ReturnType<typeof createGeminiImageClient>;

export function createGeminiImageClient(config: {
  apiKey: string;
  model: string;
}) {
  async function generateImage(
    input: GeminiImageInput,
  ): Promise<{ bytes: Buffer; mimeType: string }> {
    const client = new GoogleGenAI({ apiKey: config.apiKey });

    return generateGeminiImageWithClient(client, {
      model: config.model,
      prompt: input.prompt,
      carBase64: input.carBytes.toString("base64"),
      carMimeType: input.carMimeType,
      wrapBase64: input.wrapBytes.toString("base64"),
      wrapMimeType: input.wrapMimeType,
    });
  }

  return {
    generateImage,
  };
}

type GenerateImageWithClientInput = {
  model: string;
  prompt: string;
  carBase64: string;
  carMimeType: string;
  wrapBase64: string;
  wrapMimeType: string;
};

export async function generateGeminiImageWithClient(
  client: GeminiClientLike,
  input: GenerateImageWithClientInput,
): Promise<{ bytes: Buffer; mimeType: string }> {
  const response = await client.models.generateContent({
    model: input.model,
    contents: buildUserContents(input),
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const image = extractImageFromResponse(response);
  if (!image) {
    throw new Error("gemini returned no image data");
  }

  return image;
}

function buildUserContents(input: GenerateImageWithClientInput): Content[] {
  return [
    {
      role: "user",
      parts: [
        { text: input.prompt },
        createPartFromBase64(input.carBase64, input.carMimeType),
        createPartFromBase64(input.wrapBase64, input.wrapMimeType),
      ],
    },
  ];
}

function extractImageFromResponse(
  response: GenerateContentResponse,
): { bytes: Buffer; mimeType: string } | null {
  const candidates = response.candidates ?? [];

  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? [];
    for (const part of parts) {
      const base64 = part.inlineData?.data;
      if (!base64) {
        continue;
      }

      return {
        bytes: Buffer.from(base64, "base64"),
        mimeType: part.inlineData?.mimeType ?? "image/png",
      };
    }
  }

  return null;
}
