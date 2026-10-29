export interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by the `validate` middleware with Zod-parsed values.
       */
      validated?: ValidatedRequestData;
    }
  }
}

export {};
