import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWantDto } from './dto/create-want.dto';
import { UpdateWantDto } from './dto/update-want.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { Want } from './entities/want.entity';
import { Carta } from 'src/library/entities/library.entity';
import { BulkImportResult, UtilsService } from 'src/utils/utils.service';

@Injectable()
export class WantService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
    @InjectRepository(Want)
    private wantRepositorio: Repository<Want>,
    @InjectRepository(Carta)
    private cartaRepositorio: Repository<Carta>,
    private utilsService: UtilsService,
  ) {}

  async create(createWantDto: CreateWantDto) {
    const usuario = await this.usuarioRepositorio.findOne({
      where: { id: createWantDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `O usuário: ${createWantDto.usuarioId} não existe`,
      );
    }

    const want = this.wantRepositorio.create({
      ...createWantDto,
      usuario,
    });

    return this.wantRepositorio.save(want);
  }

  findAll() {
    return this.wantRepositorio.find({
      relations: ['usuario', 'cartas'],
    });
  }

  async findOne(id: number) {
    const want = await this.wantRepositorio.findOne({
      where: { id },
      relations: ['usuario', 'cartas'],
    });

    if (!want) {
      throw new NotFoundException(`Wantlist card #${id} não existe`);
    }

    return want;
  }

  async findByUser(userId: number) {
    const want = await this.wantRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'], // ajuste se o nome for diferente
    });

    if (!want) return null;

    // Mapeia para DTO simples evitando objetos pesados / loops
    return {
      id: want.id,
      usuarioId: userId,
      cartas: (want.cartas ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        set: c.setName,
        image: c.imageNormal,
        // acrescente campos necessários
      })),
    };
  }

  async update(id: number, updateWantDto: UpdateWantDto) {
    const want = await this.findOne(id);
    await this.wantRepositorio.update(want.id, updateWantDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.wantRepositorio.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Want #${id} não encontrado`);
    }
  }

  async addCartasToWant(wantId: number, cartaIds: number[]): Promise<Want> {
    const want = await this.wantRepositorio.findOne({
      where: { id: wantId },
      relations: ['cartas'],
    });

    if (!want) {
      throw new NotFoundException('Wantlist não encontrada');
    }

    const cartas = await this.cartaRepositorio.findBy({ id: In(cartaIds) });

    want.cartas = [...want.cartas, ...cartas];

    return this.wantRepositorio.save(want);
  }

  async removeCartasFromWant(
    wantId: number,
    cartaIds: number[],
  ): Promise<Want> {
    const want = await this.wantRepositorio.findOne({
      where: { id: wantId },
      relations: ['cartas'],
    });

    if (!want) {
      throw new NotFoundException('Wantlist não encontrada');
    }

    want.cartas = want.cartas.filter((carta) => !cartaIds.includes(carta.id));

    return this.wantRepositorio.save(want);
  }

  async addBulkCards(
    userId: number,
    cardNames: string[],
  ): Promise<BulkImportResult> {
    // Get user's passe or create one
    let want = await this.wantRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!want) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Use the generic bulk import service
    return this.utilsService.addBulkCards(cardNames, {
      entityName: 'Want',
      checkExisting: async (names: string[]) => {
        // Return set of existing card names (lowercase)
        return new Set(
          want.cartas?.map((carta) => carta.name.toLowerCase()) || [],
        );
      },
      addCards: async (cardIds: number[]) => {
        await this.addCartasToWant(want.id, cardIds);
      },
    });
  }

  async addSingleCard(userId: number, cardId: number): Promise<void> {
    console.log(
      `[WantService] Adding card ${cardId} to user ${userId} want list`,
    );

    // Get user's want list
    let want = await this.wantRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!want) {
      // Create want list if it doesn't exist
      const usuario = await this.usuarioRepositorio.findOne({
        where: { id: userId },
      });

      if (!usuario) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      throw new NotFoundException(`Want not found`);
    }

    // Check if card exists
    const carta = await this.cartaRepositorio.findOne({
      where: { id: cardId },
    });

    if (!carta) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Check if card is already in want list
    const cardAlreadyExists = want.cartas?.some((c) => c.id === cardId);
    if (cardAlreadyExists) {
      throw new ConflictException(
        `Card "${carta.name}" is already in your want list`,
      );
    }

    // Add card using existing method
    await this.addCartasToWant(want.id, [cardId]);

    console.log(
      `[WantService] Card "${carta.name}" added to want list successfully`,
    );
  }

  async isOwnedBy(wantId: number, userId: number): Promise<boolean> {
    const want = await this.findOne(wantId);
    if (!want) return false;
    const owner = Number(
      (want as any).userId ?? (want as any).usuarioId ?? (want as any).ownerId,
    );
    return Number.isFinite(owner) && owner === Number(userId);
  }
}
