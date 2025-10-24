import { Module } from '@nestjs/common';
import { PasseService } from './passe.service';
import { PasseController } from './passe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Passe } from './entities/passe.entity';
import { Carta } from 'src/library/entities/library.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';
import { ResourceOwnerGuard } from 'src/auth/guards/resource-owner.guard';
import { OwnerUserParamGuard } from 'src/auth/guards/owner-user-param.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Passe, Carta]),
    UtilsModule,
    AuthModule,
  ],
  controllers: [PasseController],
  providers: [PasseService, ResourceOwnerGuard, OwnerUserParamGuard],
  exports: [PasseService],
})
export class PasseModule {}
