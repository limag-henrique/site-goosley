export class PortalError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "PORTAL_ERROR"
  ) {
    super(message);
  }
}

export class UnauthorizedError extends PortalError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends PortalError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends PortalError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof PortalError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message } },
    { status: 500 }
  );
}
