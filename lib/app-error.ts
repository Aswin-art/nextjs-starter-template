/**
 * Custom application error class for consistent error handling.
 * Use this instead of throwing raw strings or generic Error.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      isOperational?: boolean;
      code?: string;
    },
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.code = options?.code;
    this.name = "AppError";

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory for 400 Bad Request errors
   */
  static badRequest(message: string, code?: string): AppError {
    return new AppError(400, message, { code });
  }

  /**
   * Factory for 401 Unauthorized errors
   */
  static unauthorized(message = "Unauthorized", code?: string): AppError {
    return new AppError(401, message, { code });
  }

  /**
   * Factory for 403 Forbidden errors
   */
  static forbidden(message = "Forbidden", code?: string): AppError {
    return new AppError(403, message, { code });
  }

  /**
   * Factory for 404 Not Found errors
   */
  static notFound(message = "Resource not found", code?: string): AppError {
    return new AppError(404, message, { code });
  }

  /**
   * Factory for 409 Conflict errors
   */
  static conflict(message: string, code?: string): AppError {
    return new AppError(409, message, { code });
  }

  /**
   * Factory for 422 Unprocessable Entity errors
   */
  static unprocessable(message: string, code?: string): AppError {
    return new AppError(422, message, { code });
  }

  /**
   * Factory for 500 Internal Server errors
   */
  static internal(message = "Internal server error", code?: string): AppError {
    return new AppError(500, message, { isOperational: false, code });
  }
}
