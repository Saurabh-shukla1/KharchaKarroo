import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...rest } = createCategoryDto;
    
    const category = this.categoryRepository.create(rest);
    
    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      
      category.parent = parent;
    }
    
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const { parentId, ...rest } = updateCategoryDto;
    
    const category = await this.findOne(id);
    
    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      
      category.parent = parent;
    }
    
    Object.assign(category, rest);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
