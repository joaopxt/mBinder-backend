import { SetMetadata } from '@nestjs/common';

export const OWNER_USER_PARAM_KEY = 'ownerUserParam';

/**
 * Define qual parâmetro de rota carrega o userId do dono (default: 'userId').
 * Ex.: @OwnerUserParam('userId') em rotas /:userId/...
 */
export const OwnerUserParam = (paramName: string = 'userId') =>
  SetMetadata(OWNER_USER_PARAM_KEY, paramName);
