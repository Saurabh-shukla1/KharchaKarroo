import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.CUSTOMER, // Default role
    });
    
    const savedUser = await this.userRepository.save(user);
    
    // Exclude sensitive data from response
    const { password, passwordResetToken, passwordResetExpires, ...result } = savedUser;
    return result;
  }

  async findOne(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const { password, passwordResetToken, passwordResetExpires, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    
    const { password, passwordResetToken, passwordResetExpires, ...result } = updatedUser;
    return result;
  }
}
