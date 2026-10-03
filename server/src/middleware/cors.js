import cors from 'cors';

/** Shared CORS policy (open; restrict `origin` to your domains in production). */
export const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
