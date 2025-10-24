import { Module } from '@nestjs/common';
import { WantService } from './want.service';
import { WantController } from './want.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Want } from './entities/want.entity';
import { Carta } from 'src/library/entities/library.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { ResourceOwnerGuard } from 'src/auth/guards/resource-owner.guard';
import { OwnerUserParamGuard } from 'src/auth/guards/owner-user-param.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Want, Carta]),
    UtilsModule,
    AuthModule,
  ],
  controllers: [WantController],
  providers: [WantService, ResourceOwnerGuard, OwnerUserParamGuard],
  exports: [WantService],
})
export class WantModule {}
