import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const nickname = req.params?.nickname;
    if (!nickname) throw new ForbiddenException('Invalid target');

    if (user.nickname && user.nickname === nickname) return true;

    throw new ForbiddenException('You can only update your own account');
  }
}
