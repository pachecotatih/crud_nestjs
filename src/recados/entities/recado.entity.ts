import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recados')
export class Recado {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  texto!: string;

  // Muitos recados podem ser enviados por uma única pessoa
  @ManyToOne(() => Pessoa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // Especifica a coluna "de" que armazena o ID da pessoa que enviou o recado
  @JoinColumn({ name: 'de' })
  de!: Pessoa;

  // Muitos recados podem ser recebidos por uma única pessoa (destinatário)
  @ManyToOne(() => Pessoa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // Especifica a coluna "para" que armazena o ID da pessoa que enviou o recado
  @JoinColumn({ name: 'para' })
  para!: Pessoa;
  @Column({ type: 'boolean', default: false })
  lido!: boolean;

  @Column({ type: 'timestamp' })
  data!: Date; //created_at

  @CreateDateColumn()
  createdAt?: Date; //created_at
  @UpdateDateColumn()
  updatedAt?: Date; // updated_at
}
