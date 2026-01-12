import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./app-error";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
  code?: string;
}

type ApiHandler<T = unknown> = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse<ApiResponse<T>>>;

/**
 * Wraps API route handlers with consistent error handling.
 * Catches AppError and unknown errors, returning appropriate JSON responses.
 */
export function apiHandler<T = unknown>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            status: "error" as const,
            message: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        ) as NextResponse<ApiResponse<T>>;
      }

      // Unknown error - log and return generic 500
      console.error("[API Error]", error);

      return NextResponse.json(
        {
          status: "error" as const,
          message: "Internal server error",
        },
        { status: 500 },
      ) as NextResponse<ApiResponse<T>>;
    }
  };
}

/**
 * Helper to create successful JSON responses
 */
export function apiSuccess<T>(
  data: T,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      status: "success",
      data,
    },
    { status },
  );
}

/**
 * Helper to create error JSON responses
 */
export function apiError(
  message: string,
  status = 400,
  code?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json<ApiResponse>(
    {
      status: "error",
      message,
      code,
    },
    { status },
  );
}
