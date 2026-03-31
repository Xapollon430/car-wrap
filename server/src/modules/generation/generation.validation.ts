import { badRequest } from "../../lib/errors.js";
import { sanitizeGeneratedFileName } from "./generation.helpers.js";

export function parseGenerateInput(body: unknown): {
  carName: string;
  wrapName: string;
} {
  const carName = readOptionalString(body, "carName");
  const wrapName = readOptionalString(body, "wrapName");
  if (!carName || !wrapName) {
    throw badRequest("carName and wrapName are required");
  }
  return { carName, wrapName };
}

export function parseGeneratedFileName(value: string): string {
  const fileName = sanitizeGeneratedFileName(value);
  if (!fileName) {
    throw badRequest("invalid generated image name");
  }
  return fileName;
}

function readOptionalString(body: unknown, fieldName: string): string {
  if (!isRecord(body)) {
    return "";
  }
  const value = body[fieldName];
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
