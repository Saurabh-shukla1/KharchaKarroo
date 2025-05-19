import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;

  @Column()
  method: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  paidAt: Date;
}
