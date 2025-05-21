import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRole } from '../users/entities/user.entity';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUserStats: jest.fn(),
    promoteToAdmin: jest.fn(),
    demoteFromAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', role: UserRole.CUSTOMER },
        { id: '2', email: 'user2@example.com', role: UserRole.ADMIN },
      ];

      mockAdminService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toBe(mockUsers);
      expect(mockAdminService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a single user', async () => {
      const mockUser = { id: '1', email: 'user@example.com', role: UserRole.CUSTOMER };
      mockAdminService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('1');
      expect(result).toBe(mockUser);
      expect(mockAdminService.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        phone: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      };
      const mockUser = { id: '1', ...createUserDto, role: UserRole.CUSTOMER };

      mockAdminService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);
      expect(result).toBe(mockUser);
      expect(mockAdminService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should update and return a user', async () => {
      const updateUserDto = {
        email: 'updated@example.com',
        role: UserRole.CUSTOMER,
      };
      const mockUser = { id: '1', ...updateUserDto };

      mockAdminService.updateUser.mockResolvedValue(mockUser);

      const result = await controller.updateUser('1', updateUserDto);
      expect(result).toBe(mockUser);
      expect(mockAdminService.updateUser).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('deleteUser', () => {
    it('should call service to delete user', async () => {
      await controller.deleteUser('1');
      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total: 10,
        admins: 2,
        customers: 8,
      };

      mockAdminService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getUserStats();
      expect(result).toBe(mockStats);
      expect(mockAdminService.getUserStats).toHaveBeenCalled();
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        role: UserRole.ADMIN,
      };

      mockAdminService.promoteToAdmin.mockResolvedValue(mockUser);

      const result = await controller.promoteToAdmin('1');
      expect(result).toBe(mockUser);
      expect(mockAdminService.promoteToAdmin).toHaveBeenCalledWith('1');
    });
  });

  describe('demoteFromAdmin', () => {
    it('should demote admin to customer', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        role: UserRole.CUSTOMER,
      };

      mockAdminService.demoteFromAdmin.mockResolvedValue(mockUser);

      const result = await controller.demoteFromAdmin('1');
      expect(result).toBe(mockUser);
      expect(mockAdminService.demoteFromAdmin).toHaveBeenCalledWith('1');
    });
  });
}); 