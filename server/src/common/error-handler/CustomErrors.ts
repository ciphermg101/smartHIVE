export class NotFoundError extends Error {
  status: number;
  constructor(message = 'Not Found') {
    super(message);
    this.status = 404;
  }
}

export class UnauthorizedError extends Error {
  status: number;
  constructor(message = 'Unauthorized') {
    super(message);
    this.status = 401;
  }
}

export class ForbiddenError extends Error {
  status: number;
  constructor(message = 'Forbidden') {
    super(message);
    this.status = 403;
  }
}

export class ValidationError extends Error {
  status: number;
  constructor(message = 'Validation Error') {
    super(message);
    this.status = 400;
  }
} 