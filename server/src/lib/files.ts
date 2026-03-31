import { promises as fs } from "node:fs";

export type StreamableFile = {
  mimeType: string;
  cacheControl: string;
  stream: NodeJS.ReadableStream;
};

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
