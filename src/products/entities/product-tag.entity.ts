import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_tags')
export class ProductTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  @Index()
  name: string;

  @Column('varchar', { nullable: true })
  description: string;

  @ManyToOne(() => Product, (product) => product.productTags)
  product: Product;
} 