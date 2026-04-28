import { Request, Response, NextFunction } from "express";
import { HttpError } from "./HttpError.js";

/**
 * Global error handler middleware
 * Catches all errors and returns sanitized responses
 * Never exposes database details or sensitive information
 */
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  // Handle HttpError (custom application errors)
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Handle Supabase/Database errors - sanitize messages
  if (err instanceof Error) {
    const message = err.message.toLowerCase();

    // Check for specific database errors and return generic messages
    if (message.includes("unique violation") || message.includes("duplicate key")) {
      return res.status(409).json({
        error: "Este recurso ya existe",
      });
    }

    if (message.includes("foreign key violation")) {
      return res.status(400).json({
        error: "Datos relacionados inválidos",
      });
    }

    if (message.includes("not found") || message.includes("pgrst116")) {
      return res.status(404).json({
        error: "Recurso no encontrado",
      });
    }

    if (message.includes("invalid") || message.includes("syntax")) {
      return res.status(400).json({
        error: "Datos inválidos",
      });
    }

    // Generic error for database/unknown errors - NEVER expose details
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  // Fallback for unknown error types
  res.status(500).json({
    error: "Error interno del servidor",
  });
};
