import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('most_wanted')
export class MostWanted {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'card_id' })
  cardId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_small' })
  imageSmall?: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'image_normal',
  })
  imageNormal?: string | null;

  @Column({ type: 'int', default: 0 })
  count: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
