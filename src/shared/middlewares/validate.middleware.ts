import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "../../core/errors/HttpError.js";

/**
 * Validation middleware factory
 * Takes a Zod schema and returns middleware that validates request body
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validatedData = schema.parse(req.body);

      // Replace request body with validated data
      req.body = validatedData;

      next();
    } catch (error: any) {
      // Zod throws ZodError with issues array
      if (error.issues && Array.isArray(error.issues)) {
        const messages = error.issues.map((issue: any) => {
          const path = issue.path.join(".");
          return `${path}: ${issue.message}`;
        });

        return res.status(400).json({
          error: "Validación fallida",
          details: messages,
        });
      }

      return res.status(400).json({
        error: "Datos inválidos",
      });
    }
  };
};
