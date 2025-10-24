import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BestSeller } from './entities/best-seller.entity';
import { Passe } from '../passe/entities/passe.entity';
import { Carta } from '../library/entities/library.entity';

@Injectable()
export class BestSellersService {
  constructor(
    @InjectRepository(BestSeller)
    private readonly bestRepo: Repository<BestSeller>,
    @InjectRepository(Passe) private readonly passeRepo: Repository<Passe>,
    @InjectRepository(Carta)
    private readonly libraryRepo: Repository<Carta>,
  ) {}

  async refreshFromPasse(limit = 10) {
    // Conta as cartas mais frequentes em Passe
    const rows = await this.passeRepo
      .createQueryBuilder('passe')
      .leftJoin('passe.cartas', 'carta')
      .select('carta.id', 'cardId')
      // Conta em quantas listas Passe distintas a carta aparece
      .addSelect('COUNT(DISTINCT passe.id)', 'count')
      .where('carta.id IS NOT NULL')
      .groupBy('carta.id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ cardId: number; count: string }>();

    const cardIds = rows.map((r) => r.cardId);
    const cards = cardIds.length
      ? await this.libraryRepo.find({ where: { id: In(cardIds) } })
      : [];

    const byId = new Map(cards.map((c: any) => [c.id, c]));
    const toSave = rows.map((r) => {
      const c = byId.get(r.cardId);
      const entity = this.bestRepo.create({
        cardId: r.cardId,
        count: Number(r.count),
        name: c?.name ?? null,
        imageSmall: c?.image_small ?? c?.imageSmall ?? null,
        imageNormal: c?.image_normal ?? c?.imageNormal ?? null,
      });
      return entity;
    });

    // Limpa e salva top (simples)
    await this.bestRepo.clear();
    await this.bestRepo.save(toSave);
    return this.findTop(limit);
  }

  async findTop(limit = 10) {
    return this.bestRepo.find({
      order: { count: 'DESC' },
      take: limit,
    });
  }
}
