import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  fullName: string;

  @Column()
  flat: string;

  @Column()
  street: string;

  @Column()
  landMark: string;

  @Column()
  city: string;

  @Column()
  zipCode: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDefault: boolean;
}
