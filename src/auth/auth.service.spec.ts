import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    it('should successfully create a new user', async () => {
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ id: 1, ...signupDto, password: hashedPassword });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...signupDto, password: hashedPassword });
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('token', 'jwt_token');
      expect(result.user).toHaveProperty('email', signupDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, ...signupDto });

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const user = {
        id: 1,
        ...loginDto,
        password: await bcrypt.hash(loginDto.password, 10),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt_token');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token', 'jwt_token');
      expect(result.user).toHaveProperty('email', loginDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: 1,
        ...loginDto,
        password: await bcrypt.hash('different_password', 10),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordReset', () => {
    const email = 'test@example.com';

    it('should generate reset token for existing user', async () => {
      const user = { id: 1, email };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, passwordResetToken: 'token' });

      const result = await service.requestPasswordReset({ email });

      expect(result).toHaveProperty('message', 'Password reset email sent');
      expect(result).toHaveProperty('resetToken');
    });

    it('should throw BadRequestException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.requestPasswordReset({ email })).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const resetDto = {
      token: 'valid_token',
      newPassword: 'new_password123',
    };

    it('should successfully reset password', async () => {
      const user = {
        id: 1,
        passwordResetToken: resetDto.token,
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, password: 'new_hashed_password' });

      const result = await service.resetPassword(resetDto);

      expect(result).toHaveProperty('message', 'Password successfully reset');
    });

    it('should throw BadRequestException if token is invalid or expired', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
    });
  });
});