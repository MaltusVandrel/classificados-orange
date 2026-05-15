import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { decrypt } from '../../shared/lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    login: string;
    role: string;
    expires: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const path = req.originalUrl.split('?')[0];

    const isPublicPath =
      path.startsWith('/assets/') ||
      path === '/favicon.ico' ||
      path === '/auth/login';

    const sessionCookie = req.cookies?.session;
    let isLoggedIn = false;

    if (sessionCookie) {
      try {
        const payload = await decrypt(sessionCookie);
        if (payload.expires && new Date(payload.expires as string) > new Date()) {
          isLoggedIn = true;
          req.user = {
            sub: payload.sub as number,
            login: payload.login as string,
            role: payload.role as string,
            expires: payload.expires as string,
          };
        }
      } catch {
        isLoggedIn = false;
      }
    }

    if (isLoggedIn && path === '/auth/login' && req.method === 'GET') {
      res.redirect('/artefatos');
      return false;
    }

    if (!isLoggedIn && !isPublicPath) {
      res.redirect('/auth/login');
      return false;
    }

    return true;
  }
}
