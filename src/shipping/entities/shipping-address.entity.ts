import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('shipping_addresses')
export class ShippingAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column({ nullable: true })
  phone: string;

  @OneToOne(() => Order, order => order.shippingAddress)
  order: Order;
} 