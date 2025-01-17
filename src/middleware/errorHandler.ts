import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";

export const errorHandler = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err instanceof CustomError ? err.message :
    "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
