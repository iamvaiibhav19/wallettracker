import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateInput =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((error) => {
        return {
          field: error.path.join("."),
          message: error.message,
        };
      });

      res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    } else {
      req.body = result.data;
      next();
    }
  };
