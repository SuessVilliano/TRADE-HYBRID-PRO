import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request body against Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = await schema.parseAsync(req.body);
      // Replace request body with validated data
      req.body = validData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errorMessages = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({ 
          error: 'Validation error', 
          details: errorMessages 
        });
      }
      
      console.error('Validation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};