import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepositorio: Repository<Usuario>,
  ) {}

  // Valida usuário por email OU nickname
  async validateUser(
    login: string,
    password: string,
  ): Promise<Omit<Usuario, 'password'> | null> {
    const user = await this.usuarioRepositorio
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :login OR usuario.nickname = :login', { login })
      .getOne();

    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const { password: _, ...safe } = user as any;
    return safe;
  }

  async login(user: Omit<Usuario, 'password'>) {
    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
