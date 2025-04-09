import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware
 */
class ErrorMiddleware {
  /**
   * Handle errors that occur during request processing
   * @param err - The error that occurred
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static handleError(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Can be expanded to handle different types of errors with different status codes
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  }

  /**
   * Handle 404 errors for routes that don't exist
   * @param req - Express request object
   * @param res - Express response object
   */
  static notFound(req: Request, res: Response): void {
    res.status(404).json({
      message: `Not Found - ${req.originalUrl}`
    });
  }
}

export default ErrorMiddleware;
