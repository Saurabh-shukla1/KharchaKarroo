import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find();
    return users.map(user => {
      const { password, passwordResetToken, passwordResetExpires, ...result } = user;
      return result;
    });
  }

  async getUserById(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, passwordResetToken, passwordResetExpires, ...result } = user;
    return result;
  }

  async createUser(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, phone } = createUserDto;

    // Check if user exists with same email
    const userWithEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (userWithEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if user exists with same phone
    const userWithPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (userWithPhone) {
      throw new BadRequestException('User with this phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      const { password, passwordResetToken, passwordResetExpires, ...result } = savedUser;
      return result;
    } catch (error) {
      // Handle any other database errors
      if (error.code === '23505') { // PostgreSQL unique violation code
        if (error.detail.includes('email')) {
          throw new BadRequestException('User with this email already exists');
        }
        if (error.detail.includes('phone')) {
          throw new BadRequestException('User with this phone number already exists');
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, updateUserDto: AdminUpdateUserDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow changing role to ADMIN through this endpoint
    if (updateUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot set user role to ADMIN through this endpoint');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);
    const { password, passwordResetToken, passwordResetExpires, ...result } = savedUser;
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete an admin user');
    }

    await this.userRepository.remove(user);
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const adminUsers = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    const customerUsers = await this.userRepository.count({ where: { role: UserRole.CUSTOMER } });

    return {
      total: totalUsers,
      admins: adminUsers,
      customers: customerUsers,
    };
  }

  async promoteToAdmin(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = UserRole.ADMIN;
    const savedUser = await this.userRepository.save(user);
    const { password, passwordResetToken, passwordResetExpires, ...result } = savedUser;
    return result;
  }

  async demoteFromAdmin(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent demoting the last admin
    const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    if (adminCount <= 1 && user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot demote the last admin user');
    }

    user.role = UserRole.CUSTOMER;
    const savedUser = await this.userRepository.save(user);
    const { password, passwordResetToken, passwordResetExpires, ...result } = savedUser;
    return result;
  }

  async createFirstAdmin(createUserDto: CreateUserDto) {
    // Check if any admin exists
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN }
    });

    if (adminCount > 0) {
      throw new BadRequestException('Admin user already exists');
    }

    const { email, password, phone } = createUserDto;

    // Check if user exists with same email
    const userWithEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (userWithEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if user exists with same phone
    const userWithPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (userWithPhone) {
      throw new BadRequestException('User with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _, ...result } = savedUser;
    return result;
  }
} 