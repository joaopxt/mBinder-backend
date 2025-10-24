import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor(cfg: ConfigService) {
    const secret = cfg.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET not set. Defina no .env (ex.: JWT_SECRET=um_segredo_forte)',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
      role: payload.role,
      roles: payload.roles ?? (payload.role ? [payload.role] : []),
    };
  }
}
