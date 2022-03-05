import { Request, Response } from 'express';
import { Session } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request & { session?: Session & { userId?: number } };
  res: Response;
  redis: Redis;
}

// Random junk
// req: Request & { session: session.Session}
// req: Request & {
//   session: Session & Partial<SessionData> & { userId: number };
// };