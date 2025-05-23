import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  value: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceAdjustment: number;

  @Column('int', { default: 0 })
  stockCount: number;

  @Column('varchar', { unique: true })
  sku: string;

  @ManyToOne(() => Product, (product) => product.variants)
  product: Product;
} 