import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColecaoDto } from './dto/create-colecao.dto';
import { UpdateColecaoDto } from './dto/update-colecao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { Colecao } from './entities/colecao.entity';
import { Carta } from 'src/library/entities/library.entity';
import { BulkImportResult, UtilsService } from 'src/utils/utils.service';

@Injectable()
export class ColecaoService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
    @InjectRepository(Colecao)
    private colecaoRepositorio: Repository<Colecao>,
    @InjectRepository(Carta)
    private cartaRepositorio: Repository<Carta>,

    private utilsService: UtilsService,
  ) {}

  async create(createColecaoDto: CreateColecaoDto) {
    const usuario = await this.usuarioRepositorio.findOne({
      where: { id: createColecaoDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `O usuário: ${createColecaoDto.usuarioId} não existe`,
      );
    }

    const colecao = this.colecaoRepositorio.create({
      ...createColecaoDto,
      usuario,
    });

    return this.colecaoRepositorio.save(colecao);
  }

  async findAll() {
    return await this.colecaoRepositorio.find({
      relations: ['usuario', 'cartas'],
    });
  }

  async findOne(id: number) {
    const colecao = await this.colecaoRepositorio.findOne({
      where: { id },
      relations: ['usuario', 'cartas'],
    });

    if (!colecao) {
      throw new NotFoundException(`Colecao #${id} não encontrada`);
    }

    return colecao;
  }

  async findByUserId(userId: number) {
    const colecao = await this.colecaoRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!colecao) return null;

    return {
      id: colecao.id,
      usuarioId: userId,
      cartas: (colecao.cartas ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        set: c.setName,
        image: c.imageNormal,
      })),
    };
  }

  async update(id: number, updateColecaoDto: UpdateColecaoDto) {
    const colecao = await this.findOne(id);
    await this.colecaoRepositorio.update(colecao.id, updateColecaoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.colecaoRepositorio.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Colecao #${id} não encontrado`);
    }
  }

  async addCartasToColecao(
    colecaoId: number,
    cartaIds: number[],
  ): Promise<Colecao> {
    const colecao = await this.colecaoRepositorio.findOne({
      where: { id: colecaoId },
      relations: ['cartas'],
    });

    if (!colecao) {
      throw new NotFoundException('Colecao não encontrada');
    }

    const cartas = await this.cartaRepositorio.findBy({ id: In(cartaIds) });

    colecao.cartas = [...colecao.cartas, ...cartas];

    return this.colecaoRepositorio.save(colecao);
  }

  async addCardToColecao(colecaoId: number, cardId: number): Promise<Colecao> {
    const colecao = await this.colecaoRepositorio.findOne({
      where: { id: colecaoId },
      relations: ['cartas'],
    });

    if (!colecao) {
      throw new NotFoundException('Colecao não encontrada');
    }

    const carta = await this.cartaRepositorio.findBy({ id: cardId });

    colecao.cartas = [...colecao.cartas, ...carta];

    return this.colecaoRepositorio.save(colecao);
  }

  async removeCardFromColecao(
    colecaoId: number,
    cardId: number,
  ): Promise<Colecao> {
    const colecao = await this.colecaoRepositorio.findOne({
      where: { id: colecaoId },
      relations: ['cartas'],
    });

    if (!colecao) {
      throw new NotFoundException('Colecao não encontrada');
    }

    colecao.cartas = colecao.cartas.filter((carta) => cardId != carta.id);

    return this.colecaoRepositorio.save(colecao);
  }

  async bulkImport(
    userId: number,
    cardNames: string[],
  ): Promise<BulkImportResult> {
    console.log(
      `[ColecaoService] Adding bulk cards for user ${userId}:`,
      cardNames,
    );

    // Get user's passe or create one
    let colecao = await this.colecaoRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!colecao) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Use the generic bulk import service
    return this.utilsService.addBulkCards(cardNames, {
      entityName: 'Colecao',
      checkExisting: async (names: string[]) => {
        // Return set of existing card names (lowercase)
        return new Set(
          colecao.cartas?.map((carta) => carta.name.toLowerCase()) || [],
        );
      },
      addCards: async (cardIds: number[]) => {
        await this.addCartasToColecao(colecao.id, cardIds);
      },
    });
  }
}
