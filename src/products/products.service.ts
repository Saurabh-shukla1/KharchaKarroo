import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto, ProductSortBy, SortOrder } from './dto/query-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { Category } from '../categories/entities/category.entity';
import { slugify } from '../utils/slugify';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductAttribute)
    private readonly attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const slug = slugify(createProductDto.name);
    const existingProduct = await this.productRepository.findOne({
      where: [{ slug }, { sku: createProductDto.sku }],
    });

    if (existingProduct) {
      throw new BadRequestException('Product with this name or SKU already exists');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      slug,
      category,
    });

    await this.productRepository.save(product);

    if (createProductDto.images) {
      const images = createProductDto.images.map((image) =>
        this.imageRepository.create({
          ...image,
          product,
        }),
      );
      await this.imageRepository.save(images);
    }

    if (createProductDto.variants) {
      const variants = createProductDto.variants.map((variant) =>
        this.variantRepository.create({
          ...variant,
          product,
        }),
      );
      await this.variantRepository.save(variants);
    }

    if (createProductDto.attributes) {
      const attributes = createProductDto.attributes.map((attribute) =>
        this.attributeRepository.create({
          ...attribute,
          product,
        }),
      );
      await this.attributeRepository.save(attributes);
    }

    return this.findOne(product.id);
  }

  async findAll(filters: ProductFilterDto) {
    const {
      minPrice,
      maxPrice,
      categoryId,
      search,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
      tags,
      minRating,
    } = filters;

    const query = this.productRepository.createQueryBuilder('product');

    // Join relations
    query
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.attributes', 'attributes');

    // Apply filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: minPrice || 0,
        maxPrice: maxPrice || 999999999,
      });
    }

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tags && tags.length > 0) {
      query.andWhere('product.tags @> ARRAY[:...tags]', { tags });
    }

    if (minRating) {
      query.andWhere('product.averageRating >= :minRating', { minRating });
    }

    // Apply sorting
    switch (sortBy) {
      case ProductSortBy.PRICE:
        query.orderBy('product.price', sortOrder);
        break;
      case ProductSortBy.NAME:
        query.orderBy('product.name', sortOrder);
        break;
      case ProductSortBy.POPULARITY:
        query.orderBy('product.viewCount', sortOrder);
        break;
      case ProductSortBy.RATING:
        query.orderBy('product.averageRating', sortOrder);
        break;
      default:
        query.orderBy('product.createdAt', sortOrder);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'variants', 'attributes', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.update(id, {
      viewCount: () => 'view_count + 1',
    });

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'images', 'variants', 'attributes', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.update(product.id, {
      viewCount: () => 'view_count + 1',
    });

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.name) {
      const slug = slugify(updateProductDto.name);
      const existingProduct = await this.productRepository.findOne({
        where: { slug, id: Not(id) },
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this name already exists');
      }

      product.slug = slug;
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      product.category = category;
    }

    // Update basic fields
    Object.assign(product, updateProductDto);

    // Update images if provided
    if (updateProductDto.images) {
      await this.imageRepository.delete({ product: { id } });
      const images = updateProductDto.images.map((image) =>
        this.imageRepository.create({
          ...image,
          product,
        }),
      );
      await this.imageRepository.save(images);
    }

    // Update variants if provided
    if (updateProductDto.variants) {
      await this.variantRepository.delete({ product: { id } });
      const variants = updateProductDto.variants.map((variant) =>
        this.variantRepository.create({
          ...variant,
          product,
        }),
      );
      await this.variantRepository.save(variants);
    }

    // Update attributes if provided
    if (updateProductDto.attributes) {
      await this.attributeRepository.delete({ product: { id } });
      const attributes = updateProductDto.attributes.map((attribute) =>
        this.attributeRepository.create({
          ...attribute,
          product,
        }),
      );
      await this.attributeRepository.save(attributes);
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { isFeatured: true },
      relations: ['category', 'images'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<Product[]> {
    const product = await this.findOne(productId);

    return this.productRepository.find({
      where: {
        category: { id: product.category.id },
        id: Not(productId),
      },
      relations: ['category', 'images'],
      take: limit,
      order: { viewCount: 'DESC' },
    });
  }

  async updateProductRating(productId: string): Promise<void> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'review')
      .where('product.id = :id', { id: productId })
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const reviews = product.reviews;
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    await this.productRepository.update(productId, {
      averageRating,
      reviewCount,
    });
  }
}
