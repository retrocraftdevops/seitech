/**
 * API Error Handling & Logging
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIError(error: unknown): Promise<never> {
  if (error instanceof APIError) {
    throw error;
  }

  if (error instanceof Response) {
    const data = await error.json().catch(() => ({}));
    throw new APIError(
      data.message || 'API request failed',
      error.status,
      data.code,
      data
    );
  }

  if (error instanceof Error) {
    throw new APIError(error.message, 500);
  }

  throw new APIError('An unknown error occurred', 500);
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';
  
  if (error instanceof APIError) {
    console.error(
      `${timestamp} ${contextStr}API Error [${error.statusCode}]:`,
      error.message,
      error.details
    );
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr}Error:`, error.message, error.stack);
  } else {
    console.error(`${timestamp} ${contextStr}Unknown error:`, error);
  }

  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { context },
      });
    }
  }
}
