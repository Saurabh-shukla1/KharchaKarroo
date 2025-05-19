import { Exclude } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Address } from 'src/shipping/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude() //do not return password
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: 'UserRole', default: UserRole.CUSTOMER })
  role: UserRole;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
