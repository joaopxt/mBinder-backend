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
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Passe {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, (usuario) => usuario.passe)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;

  @ManyToMany(() => Carta, (carta) => carta.passe)
  @JoinTable()
  cartas: Carta[];
}
