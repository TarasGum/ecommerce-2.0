// utils/errors.ts
// Centralized error handling and error types

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public statusText?: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed. Please log in again.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ServerError extends Error {
  constructor(message: string = "Server error. Please try again later.") {
    super(message);
    this.name = "ServerError";
  }
}

/**
 * Parse error from API response
 */
export function parseApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  if (typeof error === "string") {
    return new ApiError(error);
  }

  return new ApiError("An unexpected error occurred");
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return error.message;
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof ServerError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Get error severity for toast notifications
 */
export function getErrorSeverity(error: unknown): "error" | "warn" | "info" {
  if (error instanceof AuthenticationError) {
    return "warn";
  }

  if (error instanceof ValidationError) {
    return "warn";
  }

  if (error instanceof NetworkError) {
    return "error";
  }

  if (error instanceof ServerError) {
    return "error";
  }

  return "error";
}
