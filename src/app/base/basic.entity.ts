import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from 'typeorm';

export class BasicEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  updatedAt?: Date;

  @UpdateDateColumn({ type: 'varchar' })
  createdBy?: string;

  @UpdateDateColumn({ type: 'varchar' })
  updatedBy?: string;
}
