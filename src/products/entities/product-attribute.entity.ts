import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  value: string;

  @Column('int')
  displayOrder: number;

  @Column('varchar', { nullable: true })
  group: string;

  @ManyToOne(() => Product, (product) => product.attributes)
  product: Product;
} 