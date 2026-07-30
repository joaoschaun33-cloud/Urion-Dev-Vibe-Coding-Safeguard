/**
 * RFC 7807 — Problem Details for HTTP APIs
 * https://tools.ietf.org/html/rfc7807
 *
 * As factories aceitam qualquer `Error` (dominio ou nao, ex.: ZodError),
 * pois so consomem `error.message`.
 */

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Array<{ field: string; message: string }>;
}

export const ProblemDetails = {
  validationFailed(error: Error, instance = ''): ProblemDetail {
    return {
      type: 'https://api.example.com/errors/validation-failed',
      title: 'Validation Failed',
      status: 400,
      detail: error.message,
      instance,
    };
  },

  notFound(error: Error, instance = ''): ProblemDetail {
    return {
      type: 'https://api.example.com/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: error.message,
      instance,
    };
  },

  unauthorized(error: Error, instance = ''): ProblemDetail {
    return {
      type: 'https://api.example.com/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: error.message,
      instance,
    };
  },

  internalError(detail: string, instance = ''): ProblemDetail {
    return {
      type: 'https://api.example.com/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail,
      instance,
    };
  },
};
