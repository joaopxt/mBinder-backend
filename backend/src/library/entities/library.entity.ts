import { Colecao } from 'src/colecao/entities/colecao.entity';
import { Deck } from 'src/deck/entities/deck.entity';
import { Passe } from 'src/passe/entities/passe.entity';
import { Want } from 'src/want/entities/want.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany,
} from 'typeorm';

@Index('idx_name_setname', ['name', 'setName'])
@Entity({ name: 'library' })
export class Carta {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', name: 'image_small', nullable: true })
  imageSmall?: string | null;

  @Column({ type: 'text', name: 'image_normal', nullable: true })
  imageNormal?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'set_name', nullable: true })
  setName?: string | null;

  // Novas colunas adicionadas
  @Column({ type: 'text', name: 'mana_cost', nullable: true })
  manaCost?: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cmc?: number | null;

  @Column({ type: 'text', name: 'type_line', nullable: true })
  typeLine?: string | null;

  @Column({ type: 'json', nullable: true })
  colors?: string[] | null;

  @Column({ type: 'json', name: 'color_identity', nullable: true })
  colorIdentity?: string[] | null;

  @Column({ type: 'json', nullable: true })
  legalities?: Record<string, string> | null;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relations (mantidas sem alteração)
  @ManyToMany(() => Deck, (deck) => deck.cartas)
  deck: Deck[];

  @ManyToMany(() => Want, (want) => want.cartas)
  want: Want[];

  @ManyToMany(() => Passe, (passe) => passe.cartas)
  passe: Passe[];

  @ManyToMany(() => Colecao, (colecao) => colecao.cartas)
  colecao: Colecao[]; // Corrigido: era Passe[], agora é Colecao[]
}
