import { type ZodTypeAny } from 'zod';
import { RequestHandler } from 'express';

type RequestPart = 'body' | 'query' | 'params';

const assignQuery = (req: any, value: Record<string, unknown>) => {
  const target = req.query as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, value);
};

const validate = (schema: ZodTypeAny, part: RequestPart): RequestHandler => {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[part]);

      if (part === 'query') {
        assignQuery(req, parsed as Record<string, unknown>);
      } else {
        req[part] = parsed;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema: ZodTypeAny) => validate(schema, 'body');
export const validateQuery = (schema: ZodTypeAny) => validate(schema, 'query');
export const validateParams = (schema: ZodTypeAny) => validate(schema, 'params');
