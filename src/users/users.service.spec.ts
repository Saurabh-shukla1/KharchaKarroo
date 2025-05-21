import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      username: 'johndoe',
    };

    it('should successfully create a new user', async () => {
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.findOne.mockResolvedValue(null);
      
      const expectedUser = {
        id: '1',
        ...createUserDto,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      };
      
      mockUserRepository.create.mockReturnValue(expectedUser);
      mockUserRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordResetToken');
      expect(result).not.toHaveProperty('passwordResetExpires');
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('role', UserRole.CUSTOMER);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: '1', ...createUserDto });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    const userId = '1';
    const user = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    };

    it('should return a user without sensitive data', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordResetToken');
      expect(result).not.toHaveProperty('passwordResetExpires');
      expect(result).toHaveProperty('email', user.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const user = {
      id: '1',
      email,
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    };

    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const userId = '1';
    const user = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    };

    const updateUserDto: UpdateUserDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should successfully update a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, ...updateUserDto });

      const result = await service.update(userId, updateUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordResetToken');
      expect(result).not.toHaveProperty('passwordResetExpires');
      expect(result).toHaveProperty('firstName', updateUserDto.firstName);
      expect(result).toHaveProperty('lastName', updateUserDto.lastName);
    });

    it('should hash password if included in update', async () => {
      const updateWithPassword: UpdateUserDto = {
        ...updateUserDto,
        password: 'newPassword123',
      };
      const hashedPassword = 'newHashedPassword';
      
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        ...updateWithPassword,
        password: hashedPassword,
      });

      const result = await service.update(userId, updateWithPassword);

      expect(result).not.toHaveProperty('password');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });
});
