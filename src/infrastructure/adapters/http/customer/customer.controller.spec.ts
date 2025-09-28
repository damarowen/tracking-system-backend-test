import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  GetAllCustomersUseCase,
  GetCustomerByIdUseCase,
  UpdateCustomerUseCase,
} from '../../../../app/use-cases/customer/customer.use-case';
import { CacheService } from '../../../common/cache/cache.service';
import { Customer } from '../../../../domain/models/customer.entity';
import { UpdateCustomerDto } from '../../../../app/ports/input/customer.dto';
import { User } from '../../../../domain/models/user.entity';

describe('CustomerController', () => {
  let controller: CustomerController;
  let createCustomerUseCase: jest.Mocked<CreateCustomerUseCase>;
  let getAllCustomersUseCase: jest.Mocked<GetAllCustomersUseCase>;
  let getCustomerByIdUseCase: jest.Mocked<GetCustomerByIdUseCase>;
  let updateCustomerUseCase: jest.Mocked<UpdateCustomerUseCase>;
  let deleteCustomerUseCase: jest.Mocked<DeleteCustomerUseCase>;
  let cacheService: jest.Mocked<CacheService>;

  const mockCustomer: Customer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    user: new User(), // Added missing user property
  };

  const mockCustomers: Customer[] = [
    mockCustomer,
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Jane Smith',
      email: 'jane@example.com',
      user: new User(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CreateCustomerUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllCustomersUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetCustomerByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateCustomerUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteCustomerUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    createCustomerUseCase = module.get(CreateCustomerUseCase);
    getAllCustomersUseCase = module.get(GetAllCustomersUseCase);
    getCustomerByIdUseCase = module.get(GetCustomerByIdUseCase);
    updateCustomerUseCase = module.get(UpdateCustomerUseCase);
    deleteCustomerUseCase = module.get(DeleteCustomerUseCase);
    cacheService = module.get(CacheService);
  });

  describe('findAll', () => {
    it('should return cached customers if available', async () => {
      cacheService.get.mockResolvedValue(mockCustomers);

      const result = await controller.findAll();

      expect(result).toEqual(mockCustomers);
      expect(cacheService.get).toHaveBeenCalledWith('customers:all');
      expect(getAllCustomersUseCase.execute).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should fetch and cache customers when cache is empty', async () => {
      cacheService.get.mockResolvedValue(null);
      getAllCustomersUseCase.execute.mockResolvedValue(mockCustomers);

      const result = await controller.findAll();

      expect(result).toEqual(mockCustomers);
      expect(cacheService.get).toHaveBeenCalledWith('customers:all');
      expect(getAllCustomersUseCase.execute).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        'customers:all',
        mockCustomers,
        600,
      );
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      getCustomerByIdUseCase.execute.mockResolvedValue(mockCustomer);

      const result = await controller.findOne(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(getCustomerByIdUseCase.execute).toHaveBeenCalledWith(
        mockCustomer.id,
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      getCustomerByIdUseCase.execute.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Customer with ID non-existent-id not found'),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCustomerDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update customer successfully', async () => {
      const updatedCustomer = { ...mockCustomer, ...updateDto };
      updateCustomerUseCase.execute.mockResolvedValue(updatedCustomer);

      const result = await controller.update(mockCustomer.id, updateDto);

      expect(result).toEqual(updatedCustomer);
      expect(updateCustomerUseCase.execute).toHaveBeenCalledWith(
        mockCustomer.id,
        updateDto,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      updateCustomerUseCase.execute.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(
        controller.update(mockCustomer.id, updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete customer successfully', async () => {
      deleteCustomerUseCase.execute.mockResolvedValue();

      const result = await controller.remove(mockCustomer.id);

      expect(result).toEqual({ message: 'Customer deleted successfully' });
      expect(deleteCustomerUseCase.execute).toHaveBeenCalledWith(
        mockCustomer.id,
      );
    });
  });
});
