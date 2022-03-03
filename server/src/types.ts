import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Session } from "express-session";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session?: Session & { userId?: number } };
  res: Response;
}

// Random junk
// req: Request & { session: session.Session}
// req: Request & {
//   session: Session & Partial<SessionData> & { userId: number };
// };