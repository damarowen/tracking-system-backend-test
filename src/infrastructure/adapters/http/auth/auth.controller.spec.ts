import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {
  LoginUseCase,
  RegisterUseCase,
} from '../../../../app/use-cases/auth/auth.use-case';
import {
  LoginUserDto,
  RegisterUserDto,
} from '../../../../app/ports/input/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;

  const mockRegisterDto: RegisterUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginUserDto = {
    email: 'john@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john@example.com',
    customerId: '223e4567-e89b-12d3-a456-426614174001',
    customer: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  const mockJwtPayload = {
    email: mockUser.email,
    sub: mockUser.id,
    customerId: mockUser.customerId,
  };

  const mockRequest = {
    user: mockJwtPayload,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RegisterUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      registerUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.register(mockRegisterDto);

      expect(result).toEqual(mockUser);
      expect(registerUseCase.execute).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      registerUseCase.execute.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockTokenResponse = { accessToken: 'jwt.token.here' };
      loginUseCase.execute.mockResolvedValue(mockTokenResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual(mockTokenResponse);
      expect(loginUseCase.execute).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      loginUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile from JWT token', () => {
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockJwtPayload);
    });
  });
});
