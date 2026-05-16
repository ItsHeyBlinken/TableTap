import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }
  if (
    err instanceof Error &&
    (err.message === "Event not found" ||
      err.message === "Outgoing card not found or already sold" ||
      err.message.startsWith("Could not complete trade"))
  ) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof Error && "code" in err && (err as { code: string }).code === "23505") {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
