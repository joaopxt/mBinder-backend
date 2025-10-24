import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Want } from 'src/want/entities/want.entity';
import { Passe } from 'src/passe/entities/passe.entity';
import { PasseModule } from 'src/passe/passe.module';
import { WantModule } from 'src/want/want.module';
import { Colecao } from 'src/colecao/entities/colecao.entity';
import { ColecaoModule } from 'src/colecao/colecao.module';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Want, Passe, Colecao]),
    WantModule,
    PasseModule,
    ColecaoModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, RolesGuard, OwnerGuard],
})
export class UsuarioModule {}
