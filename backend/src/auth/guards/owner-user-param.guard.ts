import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNER_USER_PARAM_KEY } from '../decorators/owner-user-param.decorator';

@Injectable()
export class OwnerUserParamGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const paramName =
      this.reflector.getAllAndOverride<string>(OWNER_USER_PARAM_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || 'userId';

    const raw = req.params?.[paramName];
    if (raw === undefined)
      throw new ForbiddenException(`Missing route param: ${paramName}`);

    const targetId = Number(raw);
    if (!Number.isFinite(targetId))
      throw new ForbiddenException(`Invalid ${paramName}`);

    const currentUserId = Number(user.userId ?? user.id);
    if (currentUserId === targetId) return true;

    throw new ForbiddenException('You can only operate on your own resources');
  }
}
