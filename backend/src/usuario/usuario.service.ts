import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Not, Repository } from 'typeorm';
import { Want } from 'src/want/entities/want.entity';
import { Passe } from 'src/passe/entities/passe.entity';
import { WantService } from 'src/want/want.service';
import { PasseService } from 'src/passe/passe.service';
import { ColecaoService } from 'src/colecao/colecao.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
    @InjectRepository(Want)
    private wantRepositorio: Repository<Want>,
    @InjectRepository(Passe)
    private passeRepositorio: Repository<Passe>,

    private readonly wantService: WantService,
    private readonly passeService: PasseService,
    private readonly colecaoService: ColecaoService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const hashed = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = this.usuarioRepositorio.create({
      ...createUsuarioDto,
      password: hashed,
    });

    await this.usuarioRepositorio.save(usuario);

    const want = await this.wantService.create({ usuarioId: usuario.id });
    console.log(want);
    const passe = await this.passeService.create({ usuarioId: usuario.id });
    console.log(passe);
    const colecao = await this.colecaoService.create({ usuarioId: usuario.id });
    console.log(colecao);

    return usuario;
  }

  findAll() {
    console.log('Função chamada!');
    return this.usuarioRepositorio.find({
      select: ['id', 'nome', 'nickname', 'celular', 'idade'],
    });
  }

  async findOne(nickname: string) {
    const usuario = await this.usuarioRepositorio.findOne({
      where: { nickname },
      relations: ['decks', 'want', 'passe', 'colecao'],
    });

    if (!usuario) {
      throw new NotFoundException(`O usuário: ${nickname} não existe`);
    }

    return usuario;
  }

  async update(nickname: string, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.findOne(nickname);
    await this.usuarioRepositorio.update(user.id, updateUsuarioDto);
    return this.findOne(nickname);
  }

  async remove(id: number) {
    const result = await this.usuarioRepositorio.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario #${id} não encontrado`);
    }
  }

  async findMatches(userId: number, type: 'want' | 'passe'): Promise<any> {
    if (!['want', 'passe'].includes(type)) {
      throw new Error('Tipo inválido. Use "want" ou "passe".');
    }

    // Busca as cartas do tipo escolhido pelo usuário
    const userCards = await (type === 'want'
      ? this.wantRepositorio.findOne({
          where: { usuario: { id: userId } },
          relations: ['cartas'],
        })
      : this.passeRepositorio.findOne({
          where: { usuario: { id: userId } },
          relations: ['cartas'],
        }));

    if (!userCards || !userCards.cartas.length) {
      return { message: `O usuário não possui cartas na ${type}.` };
    }

    // Extrai os nomes das cartas do usuário
    const userCardNames = userCards.cartas.map((carta) =>
      carta.name.toLowerCase(),
    );

    // Determina o tipo oposto para o match
    const oppositeType = type === 'want' ? 'passe' : 'want';

    // Busca apenas as cartas do tipo oposto que têm chance de dar match
    const oppositeCards = await (oppositeType === 'want'
      ? this.wantRepositorio
          .createQueryBuilder('want')
          .leftJoinAndSelect('want.cartas', 'carta')
          .leftJoinAndSelect('want.usuario', 'usuario')
          .where('usuario.id != :userId', { userId })
          .andWhere('LOWER(carta.name) IN (:...names)', {
            names: userCardNames,
          })
          .getMany()
      : this.passeRepositorio
          .createQueryBuilder('passe')
          .leftJoinAndSelect('passe.cartas', 'carta')
          .leftJoinAndSelect('passe.usuario', 'usuario')
          .where('usuario.id != :userId', { userId })
          .andWhere('LOWER(carta.name) IN (:...names)', {
            names: userCardNames,
          })
          .getMany());

    // Realiza o match entre as cartas - agora retorna o objeto completo da carta
    const matches: {
      id: number;
      name: string;
      image: string;
      set: string;
      usuario: string;
      tipo: string;
    }[] = [];

    for (const userCard of userCards.cartas) {
      for (const opposite of oppositeCards) {
        for (const oppositeCard of opposite.cartas) {
          if (userCard.name.toLowerCase() === oppositeCard.name.toLowerCase()) {
            matches.push({
              id: oppositeCard.id,
              name: oppositeCard.name,
              image: oppositeCard.imageNormal || oppositeCard.imageSmall || '',
              set: oppositeCard.setName || '',
              usuario: opposite.usuario.nickname,
              tipo: oppositeType,
            });
          }
        }
      }
    }

    console.log(matches);

    return matches.length ? matches : { message: 'Nenhum match encontrado.' };
  }

  async findMatchesBetweenUsers(
    userId: number,
    targetUserId: number,
    type: 'want' | 'passe',
  ): Promise<any> {
    if (!['want', 'passe'].includes(type)) {
      throw new Error('Tipo inválido. Use "want" ou "passe".');
    }

    // Busca as cartas do tipo escolhido pelo usuário
    const userCards = await (type === 'want'
      ? this.wantRepositorio.findOne({
          where: { usuario: { id: userId } },
          relations: ['cartas'],
        })
      : this.passeRepositorio.findOne({
          where: { usuario: { id: userId } },
          relations: ['cartas'],
        }));

    if (!userCards || !userCards.cartas.length) {
      return { message: `O usuário não possui cartas na ${type}.` };
    }

    // Extrai os nomes das cartas do usuário
    const userCardNames = userCards.cartas.map((carta) =>
      carta.name.toLowerCase(),
    );

    // Determina o tipo oposto para o match
    const oppositeType = type === 'want' ? 'passe' : 'want';

    // Busca apenas as cartas do tipo oposto do usuário alvo
    const oppositeCards = await (oppositeType === 'want'
      ? this.wantRepositorio.findOne({
          where: { usuario: { id: targetUserId } },
          relations: ['cartas', 'usuario'],
        })
      : this.passeRepositorio.findOne({
          where: { usuario: { id: targetUserId } },
          relations: ['cartas', 'usuario'],
        }));

    if (!oppositeCards || !oppositeCards.cartas.length) {
      return {
        message: `O usuário alvo não possui cartas na ${oppositeType}.`,
      };
    }

    // Realiza o match entre as cartas - agora retorna o objeto completo da carta
    const matches: {
      id: number;
      name: string;
      image: string;
      set: string;
      usuario: string;
      tipo: string;
    }[] = [];

    for (const userCard of userCards.cartas) {
      for (const oppositeCard of oppositeCards.cartas) {
        if (userCard.name.toLowerCase() === oppositeCard.name.toLowerCase()) {
          matches.push({
            id: oppositeCard.id,
            name: oppositeCard.name,
            image: oppositeCard.imageNormal || oppositeCard.imageSmall || '',
            set: oppositeCard.setName || '',
            usuario: oppositeCards.usuario.nickname,
            tipo: oppositeType,
          });
        }
      }
    }

    return matches.length ? matches : { message: 'Nenhum match encontrado.' };
  }
}
