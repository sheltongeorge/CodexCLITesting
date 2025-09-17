import { RequestHandler } from 'express';

export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };
};
