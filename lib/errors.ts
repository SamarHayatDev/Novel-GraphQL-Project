// Custom Error Classes
export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

// Error Response Interface
export interface ErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// Create standardized error response
export const createErrorResponse = (
  error: Error,
  statusCode: number = 500
): ErrorResponse => {
  let code = "INTERNAL_SERVER_ERROR";

  switch (error.constructor) {
    case AuthenticationError:
      code = "UNAUTHENTICATED";
      statusCode = 401;
      break;
    case AuthorizationError:
      code = "FORBIDDEN";
      statusCode = 403;
      break;
    case ValidationError:
      code = "BAD_USER_INPUT";
      statusCode = 400;
      break;
    case NotFoundError:
      code = "NOT_FOUND";
      statusCode = 404;
      break;
    case ConflictError:
      code = "CONFLICT";
      statusCode = 409;
      break;
    case RateLimitError:
      code = "RATE_LIMIT_EXCEEDED";
      statusCode = 429;
      break;
  }

  return {
    message: error.message,
    code,
    statusCode,
  };
};

// Handle GraphQL errors
export const handleGraphQLError = (error: any) => {
  // Log error for debugging
  console.error("GraphQL Error:", error);

  // If it's already a custom error, return it
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ConflictError ||
    error instanceof RateLimitError
  ) {
    return error;
  }

  // Handle mongoose validation errors
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return new ValidationError(messages.join(", "));
  }

  // Handle mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ConflictError(`${field} already exists`);
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (error.name === "CastError") {
    return new NotFoundError("Invalid ID format");
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token");
  }

  if (error.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired");
  }

  // Default to internal server error
  return new Error("Internal server error");
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const validatePassword = (password: string): void => {
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters long");
  }
};

export const validateObjectId = (
  id: string,
  fieldName: string = "ID"
): void => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const requestData = this.requests.get(identifier);

    if (!requestData || now > requestData.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (requestData.count >= this.maxRequests) {
      return false;
    }

    requestData.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const requestData = this.requests.get(identifier);
    if (!requestData) return this.maxRequests;
    return Math.max(0, this.maxRequests - requestData.count);
  }
}
