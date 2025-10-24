import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import {
  OWNER_RESOURCE_KEY,
  OwnerResourceConfig,
} from '../decorators/owner-resource.decorator';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const config = this.reflector.getAllAndOverride<OwnerResourceConfig>(
      OWNER_RESOURCE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!config) return true;

    const idRaw = req.params?.[config.param];
    const resourceId = Number(idRaw);
    if (!Number.isFinite(resourceId)) {
      throw new ForbiddenException(`Invalid param: ${config.param}`);
    }

    const userIdField = config.userIdField || 'userId';
    const userId = Number(user[userIdField] ?? user.id);
    if (!Number.isFinite(userId))
      throw new UnauthorizedException('Invalid user in request');

    const service = this.moduleRef.get<any>(config.serviceToken, {
      strict: false,
    });
    if (!service)
      throw new ForbiddenException('Ownership service not available');

    if (config.checkOwnershipMethod) {
      const method = service[config.checkOwnershipMethod];
      if (typeof method !== 'function') {
        throw new ForbiddenException('Ownership checker method not found');
      }
      const owned = await method.call(service, resourceId, userId);
      if (!owned) throw new ForbiddenException('You do not own this resource');
      return true;
    }

    const getterName = config.getByIdMethod || 'findOne';
    const getById = service[getterName];
    if (typeof getById !== 'function') {
      throw new ForbiddenException('Getter method not found');
    }
    const entity = await getById.call(service, resourceId);
    if (!entity) throw new ForbiddenException('Resource not found');

    const ownerField = config.ownerField || 'userId';
    const ownerId = Number(
      entity[ownerField] ?? entity['usuarioId'] ?? entity['ownerId'],
    );
    if (!Number.isFinite(ownerId) || ownerId !== userId) {
      throw new ForbiddenException('You do not own this resource');
    }
    return true;
  }
}
