import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  url: string;

  @Column('text', { nullable: true })
  thumbnailUrl: string;

  @Column('text', { nullable: true })
  altText: string;

  @Column('int', { default: 0 })
  displayOrder: number;

  @Column('boolean', { default: false })
  isDefault: boolean;

  @Column('json', { nullable: true })
  dimensions: {
    width: number;
    height: number;
  };

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
