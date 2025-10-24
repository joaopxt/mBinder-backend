import { Carta } from 'src/library/entities/library.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Deck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: [
      'Commander',
      'Standard',
      'Pioneer',
      'Modern',
      'Premodern',
      'Legacy',
      'Vintage',
      'Draft',
      'Selado',
      'Outros',
    ],
  })
  formato:
    | 'Commander'
    | 'Standard'
    | 'Pioneer'
    | 'Modern'
    | 'Premodern'
    | 'Legacy'
    | 'Vintage'
    | 'Draft'
    | 'Selado'
    | 'Outros';

  @ManyToMany(() => Carta, (carta) => carta.deck)
  @JoinTable()
  cartas: Carta[];

  @ManyToOne(() => Usuario, (usuario) => usuario.decks)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;
}
