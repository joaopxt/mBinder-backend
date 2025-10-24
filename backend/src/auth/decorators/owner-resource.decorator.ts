import { SetMetadata } from '@nestjs/common';

export const OWNER_RESOURCE_KEY = 'ownerResource';
export interface OwnerResourceConfig {
  /** Nome do parâmetro da rota que contém o ID do recurso (ex.: 'id') */
  param: string;
  /** Token/Tipo do serviço que será usado para verificar posse (ex.: PasseService) */
  serviceToken: any;
  /** Se definido, método booleano (id, userId) no serviço que retorna se é dono */
  checkOwnershipMethod?: string;
  /** Alternativa ao checkOwnershipMethod: buscar a entidade por ID e comparar campo de dono */
  getByIdMethod?: string; // default: 'findOne'
  ownerField?: string; // default: 'userId'
  /** Campo do req.user que contém o ID do usuário (default: 'userId' | 'id') */
  userIdField?: string;
}
export const OwnerResource = (config: OwnerResourceConfig) =>
  SetMetadata(OWNER_RESOURCE_KEY, config);
