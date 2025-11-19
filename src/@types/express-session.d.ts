// src/types/express-session.d.ts
import 'express-session';
import { UserRole } from 'generated/prisma/enums';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

declare module 'express-session' {
  interface SessionData {
    session?: SessionUser;
  }
}
