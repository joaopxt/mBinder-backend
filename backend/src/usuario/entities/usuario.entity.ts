import { Colecao } from 'src/colecao/entities/colecao.entity';
import { Deck } from 'src/deck/entities/deck.entity';
import { Passe } from 'src/passe/entities/passe.entity';
import { Want } from 'src/want/entities/want.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  idade: number;

  @Column()
  celular: string;

  @Column()
  uf: string;

  @Column()
  cidade: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: false })
  password: string;

  @OneToOne(() => Want, (want) => want.usuario)
  want: Want;

  @OneToOne(() => Passe, (passe) => passe.usuario)
  passe: Passe;

  @OneToMany(() => Deck, (deck) => deck.usuario)
  decks: Deck[];

  @OneToOne(() => Colecao, (colecao) => colecao.usuario)
  colecao: Colecao;
}
