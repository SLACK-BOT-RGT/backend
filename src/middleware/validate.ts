import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const validateRequestBody = (
  req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg, success: false });
    return
  }
  try {
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while validating the request"
    });
    return
  }
};

export { validateRequestBody };
