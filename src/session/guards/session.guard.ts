import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Express.Request>();
    if (!req.session?.session) {
      throw new UnauthorizedException('You must be logged in.');
    }
    return true;
  }
}
