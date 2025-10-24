import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OwnerGuard } from './guards/owner.guard';
import { OwnerUserParamGuard } from './guards/owner-user-param.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const secret = cfg.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET not set. Defina no .env (ex.: JWT_SECRET=um_segredo_forte)',
          );
        }

        const raw = cfg.get<string>('JWT_EXPIRES_IN');
        let expiresIn: number | StringValue;
        if (!raw) {
          expiresIn = 86400; // 1 dia (segundos)
        } else if (/^\d+$/.test(raw)) {
          expiresIn = parseInt(raw, 10);
        } else {
          expiresIn = raw as StringValue; // "1d", "12h" etc.
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, OwnerUserParamGuard],
  exports: [AuthService, OwnerUserParamGuard],
})
export class AuthModule {}
