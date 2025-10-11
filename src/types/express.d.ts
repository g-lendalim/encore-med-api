import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: {
      hospitalId: string | null;
      timezone: string;
    };
  }
}
