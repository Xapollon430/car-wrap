import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError, messageFromError } from "./errors.js";
import type { StreamableFile } from "./files.js";

export function asyncRoute(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<unknown> | unknown,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function sendStreamFile(
  file: StreamableFile,
  res: Response,
  next: NextFunction,
): void {
  res.type(file.mimeType);
  res.setHeader("Cache-Control", file.cacheControl);
  file.stream.on("error", (error) => {
    if (!res.headersSent) {
      next(error);
      return;
    }
    res.destroy(error as Error);
  });
  file.stream.pipe(res);
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = error instanceof HttpError ? error.status : 500;
  const fallback = status >= 500 ? "internal server error" : "request failed";
  res.status(status).json({
    error: messageFromError(error, fallback),
  });
}
