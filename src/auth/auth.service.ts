// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, phone, ...rest } = signupDto;

    // Check if user exists with same email
    const userWithEmail = await this.userRepository.findOne({ where: { email } });
    if (userWithEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if user exists with same phone
    const userWithPhone = await this.userRepository.findOne({ where: { phone } });
    if (userWithPhone) {
      throw new BadRequestException('User with this phone number already exists');
    }

    // Check if this is the first user
    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      phone,
      ...rest,
      role: isFirstUser ? UserRole.ADMIN : UserRole.CUSTOMER, // Make first user admin
    });

    try {
      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const token = this.jwtService.sign({ userId: savedUser.id });

      const { password: _, ...userWithoutPassword } = savedUser;
      return { token, user: userWithoutPassword };
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ userId: user.id });

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const { email } = dto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store the raw token to compare later
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    // In a real application, send this token via email
    return { message: 'Password reset email sent', resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    console.log('Attempting to reset password with token:', token);

    // Find user with valid reset token and non-expired timestamp
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Reset token expiry:', user.passwordResetExpires);
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date(0);
    await this.userRepository.save(user);

    return { message: 'Password successfully reset' };
  }
}
