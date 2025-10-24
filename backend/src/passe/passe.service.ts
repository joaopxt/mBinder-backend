import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePasseDto } from './dto/create-passe.dto';
import { UpdatePasseDto } from './dto/update-passe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { Passe } from './entities/passe.entity';
import { Carta } from 'src/library/entities/library.entity';
import { BulkImportResult, UtilsService } from 'src/utils/utils.service';

@Injectable()
export class PasseService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
    @InjectRepository(Passe)
    private passeRepositorio: Repository<Passe>,
    @InjectRepository(Carta)
    private cartaRepositorio: Repository<Carta>,
    private utilsService: UtilsService,
  ) {}

  async create(createPasseDto: CreatePasseDto) {
    const usuario = await this.usuarioRepositorio.findOne({
      where: { id: createPasseDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `O usuário: ${createPasseDto.usuarioId} não existe`,
      );
    }

    const passe = this.passeRepositorio.create({
      ...createPasseDto,
      usuario,
    });

    return this.passeRepositorio.save(passe);
  }

  findAll() {
    return this.passeRepositorio.find({
      relations: ['usuario', 'cartas'],
    });
  }

  async findOne(id: number) {
    const passe = await this.passeRepositorio.findOne({
      where: { id },
      relations: ['usuario', 'cartas'],
    });

    if (!passe) {
      throw new NotFoundException(`Passe-list card #${id} não existe`);
    }

    return passe;
  }

  async findByUser(userId: number) {
    const passe = await this.passeRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!passe) return null;

    return {
      id: passe.id,
      usuarioId: userId,
      cartas: (passe.cartas ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        set: c.setName,
        image: c.imageNormal,
      })),
    };
  }

  async update(id: number, updatePasseDto: UpdatePasseDto) {
    const passe = await this.findOne(id);
    await this.passeRepositorio.update(passe.id, updatePasseDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.passeRepositorio.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Passe #${id} não encontrado`);
    }
  }

  async addCartasToPasse(passeId: number, cartaIds: number[]): Promise<Passe> {
    const passe = await this.passeRepositorio.findOne({
      where: { id: passeId },
      relations: ['cartas'],
    });

    if (!passe) {
      throw new NotFoundException('Passe não encontrado');
    }

    const cartas = await this.cartaRepositorio.findBy({ id: In(cartaIds) });

    passe.cartas = [...passe.cartas, ...cartas];

    return this.passeRepositorio.save(passe);
  }

  async removeCartasFromPasse(
    passeId: number,
    cartaIds: number[],
  ): Promise<Passe> {
    const passe = await this.passeRepositorio.findOne({
      where: { id: passeId },
      relations: ['cartas'],
    });

    if (!passe) {
      throw new NotFoundException('Passe não encontrado');
    }

    passe.cartas = passe.cartas.filter((carta) => !cartaIds.includes(carta.id));

    return this.passeRepositorio.save(passe);
  }

  async addBulkCards(
    userId: number,
    cardNames: string[],
  ): Promise<BulkImportResult> {
    console.log(
      `[PasseService] Adding bulk cards for user ${userId}:`,
      cardNames,
    );

    // Get user's passe or create one
    let passe = await this.passeRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!passe) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Use the generic bulk import service
    return this.utilsService.addBulkCards(cardNames, {
      entityName: 'Passe',
      checkExisting: async (names: string[]) => {
        // Return set of existing card names (lowercase)
        return new Set(
          passe.cartas?.map((carta) => carta.name.toLowerCase()) || [],
        );
      },
      addCards: async (cardIds: number[]) => {
        await this.addCartasToPasse(passe.id, cardIds);
      },
    });
  }

  async addSingleCard(userId: number, cardId: number): Promise<void> {
    console.log(`[PasseService] Adding card ${cardId} to user ${userId} passe`);

    // Get user's passe
    let passe = await this.passeRepositorio.findOne({
      where: { usuario: { id: userId } },
      relations: ['cartas'],
    });

    if (!passe) {
      // Create passe if it doesn't exist
      const usuario = await this.usuarioRepositorio.findOne({
        where: { id: userId },
      });

      if (!usuario) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      throw new NotFoundException(`Passe not found`);
    }

    // Check if card exists
    const carta = await this.cartaRepositorio.findOne({
      where: { id: cardId },
    });

    if (!carta) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }

    // Check if card is already in passe
    const cardAlreadyExists = passe.cartas?.some((c) => c.id === cardId);
    if (cardAlreadyExists) {
      throw new ConflictException(
        `Card "${carta.name}" is already in your passe`,
      );
    }

    // Add card using existing method
    await this.addCartasToPasse(passe.id, [cardId]);

    console.log(
      `[PasseService] Card "${carta.name}" added to passe successfully`,
    );
  }

  async isOwnedBy(passeId: number, userId: number): Promise<boolean> {
    const passe = await this.findOne(passeId);
    if (!passe) return false;
    const owner = Number(
      (passe as any).userId ??
        (passe as any).usuarioId ??
        (passe as any).ownerId,
    );
    return Number.isFinite(owner) && owner === Number(userId);
  }
}
