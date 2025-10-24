import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { Deck } from './entities/deck.entity';
import { Carta } from 'src/library/entities/library.entity';

@Injectable()
export class DeckService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
    @InjectRepository(Deck)
    private deckRepositorio: Repository<Deck>,
    @InjectRepository(Carta)
    private cartaRepositorio: Repository<Carta>,
  ) {}

  async create(createDeckDto: CreateDeckDto) {
    const usuario = await this.usuarioRepositorio.findOne({
      where: { id: createDeckDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `O usuário: ${createDeckDto.usuarioId} não existe`,
      );
    }

    const deck = this.deckRepositorio.create({
      ...createDeckDto,
      usuario,
    });

    return this.deckRepositorio.save(deck);
  }

  findAll() {
    return this.deckRepositorio.find({
      relations: ['usuario', 'cartas'],
    });
  }

  async findOne(id: number) {
    const deck = await this.deckRepositorio.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!deck) {
      throw new NotFoundException(`O Deck: ${id} não existe`);
    }

    return deck;
  }

  async update(id: number, updateDeckDto: UpdateDeckDto) {
    const deck = await this.findOne(id);
    await this.deckRepositorio.update(deck.id, updateDeckDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.deckRepositorio.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Deck #${id} não encontrado`);
    }
  }

  async addCartasToDeck(deckId: number, cartaIds: number[]): Promise<Deck> {
    const deck = await this.deckRepositorio.findOne({
      where: { id: deckId },
      relations: ['cartas'], // Carrega as cartas já relacionadas
    });

    if (!deck) {
      throw new Error('Deck não encontrado');
    }

    // Substitui findByIds por findBy com o operador In
    const cartas = await this.cartaRepositorio.findBy({ id: In(cartaIds) });

    // Adiciona as novas cartas ao deck sem sobrescrever as existentes
    deck.cartas = [...deck.cartas, ...cartas];

    return this.deckRepositorio.save(deck);
  }

  async removeCartasFromDeck(
    deckId: number,
    cartaIds: number[],
  ): Promise<Deck> {
    const deck = await this.deckRepositorio.findOne({
      where: { id: deckId },
      relations: ['cartas'], // Carrega as cartas já relacionadas
    });

    if (!deck) {
      throw new NotFoundException('Deck não encontrado');
    }

    // Filtra as cartas que não estão na lista de IDs a serem removidos
    deck.cartas = deck.cartas.filter((carta) => !cartaIds.includes(carta.id));

    return this.deckRepositorio.save(deck);
  }
}
