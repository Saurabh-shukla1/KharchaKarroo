import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { User, UserRole } from '../users/entities/user.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users without sensitive information', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          password: 'hashedpass1',
          role: UserRole.CUSTOMER,
          passwordResetToken: 'token1',
          passwordResetExpires: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          password: 'hashedpass2',
          role: UserRole.ADMIN,
          passwordResetToken: 'token2',
          passwordResetExpires: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('passwordResetToken');
      expect(result[0]).not.toHaveProperty('passwordResetExpires');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpass',
        role: UserRole.CUSTOMER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        phone: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue({
        ...createUserDto,
        id: '1',
        role: UserRole.CUSTOMER,
      });

      const result = await service.createUser(createUserDto);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw BadRequestException if email exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        phone: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1', ...createUserDto });

      await expect(service.createUser(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenException when trying to delete admin', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        role: UserRole.ADMIN,
      });

      await expect(service.deleteUser('1')).rejects.toThrow(ForbiddenException);
    });

    it('should delete non-admin user successfully', async () => {
      const mockUser = {
        id: '1',
        role: UserRole.CUSTOMER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await expect(service.deleteUser('1')).resolves.not.toThrow();
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        role: UserRole.CUSTOMER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });

      const result = await service.promoteToAdmin('1');
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('demoteFromAdmin', () => {
    it('should throw BadRequestException when trying to demote last admin', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        role: UserRole.ADMIN,
      });
      mockUserRepository.count.mockResolvedValue(1);

      await expect(service.demoteFromAdmin('1')).rejects.toThrow(BadRequestException);
    });

    it('should demote admin to customer when not last admin', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        role: UserRole.CUSTOMER,
      });

      const result = await service.demoteFromAdmin('1');
      expect(result.role).toBe(UserRole.CUSTOMER);
    });
  });
}); 