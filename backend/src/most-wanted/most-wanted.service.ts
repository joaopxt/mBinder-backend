import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MostWanted } from './entities/most-wanted.entity';
import { Want } from '../want/entities/want.entity';
import { Carta } from '../library/entities/library.entity';

@Injectable()
export class MostWantedService {
  constructor(
    @InjectRepository(MostWanted)
    private readonly mostRepo: Repository<MostWanted>,
    @InjectRepository(Want) private readonly wantRepo: Repository<Want>,
    @InjectRepository(Carta)
    private readonly libraryRepo: Repository<Carta>,
  ) {}

  async refreshFromWant(limit = 10) {
    const rows = await this.wantRepo
      .createQueryBuilder('want')
      .leftJoin('want.cartas', 'carta')
      .select('carta.id', 'cardId')
      .addSelect('COUNT(DISTINCT want.id)', 'count') // idem para Want
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
      return this.mostRepo.create({
        cardId: r.cardId,
        count: Number(r.count),
        name: c?.name ?? null,
        imageSmall: c?.image_small ?? c?.imageSmall ?? null,
        imageNormal: c?.image_normal ?? c?.imageNormal ?? null,
      });
    });

    await this.mostRepo.clear();
    await this.mostRepo.save(toSave);
    return this.findTop(limit);
  }

  async findTop(limit = 10) {
    return this.mostRepo.find({ order: { count: 'DESC' }, take: limit });
  }
}
