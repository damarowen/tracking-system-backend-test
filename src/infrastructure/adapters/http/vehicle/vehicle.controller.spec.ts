import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import {
  CreateVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehiclesByCustomerUseCase,
  UpdateVehicleUseCase,
  DeleteVehicleUseCase,
  UpdateVehicleLocationUseCase,
} from '../../../../app/use-cases/vehicle/vehicle.use-case';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  UpdateLocationDto,
} from '../../../../app/ports/input/vehicle.dto';
import {
  Vehicle,
  VehicleStatus,
  VehicleType,
} from '../../../../domain/models/vehicle.entity';
import { NotFoundException } from '@nestjs/common';

describe('VehicleController', () => {
  let controller: VehicleController;
  let createVehicleUseCase: jest.Mocked<CreateVehicleUseCase>;
  let getAllVehiclesUseCase: jest.Mocked<GetAllVehiclesUseCase>;
  let getVehicleByIdUseCase: jest.Mocked<GetVehicleByIdUseCase>;
  let getVehiclesByCustomerUseCase: jest.Mocked<GetVehiclesByCustomerUseCase>;
  let updateVehicleUseCase: jest.Mocked<UpdateVehicleUseCase>;
  let deleteVehicleUseCase: jest.Mocked<DeleteVehicleUseCase>;
  let updateVehicleLocationUseCase: jest.Mocked<UpdateVehicleLocationUseCase>;

  const mockCustomerId = '123e4567-e89b-12d3-a456-426614174000';
  const mockVehicleId = '223e4567-e89b-12d3-a456-426614174001';

  const mockVehicle: Vehicle = {
    id: mockVehicleId,
    plateNumber: 'B1234ABC',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    type: VehicleType.CAR,
    status: VehicleStatus.ACTIVE,
    description: 'Test vehicle',
    lastLatitude: -6.2088,
    lastLongitude: 106.8456,
    lastLocationUpdate: new Date(),
    customerId: mockCustomerId,
    customer: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVehicles: Vehicle[] = [mockVehicle];

  const mockRequest = {
    user: {
      customerId: mockCustomerId,
      sub: 'user-id',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: CreateVehicleUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetAllVehiclesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetVehicleByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetVehiclesByCustomerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateVehicleUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteVehicleUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateVehicleLocationUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    createVehicleUseCase = module.get(CreateVehicleUseCase);
    getAllVehiclesUseCase = module.get(GetAllVehiclesUseCase);
    getVehicleByIdUseCase = module.get(GetVehicleByIdUseCase);
    getVehiclesByCustomerUseCase = module.get(GetVehiclesByCustomerUseCase);
    updateVehicleUseCase = module.get(UpdateVehicleUseCase);
    deleteVehicleUseCase = module.get(DeleteVehicleUseCase);
    updateVehicleLocationUseCase = module.get(UpdateVehicleLocationUseCase);
  });

  describe('create', () => {
    const createVehicleDto: CreateVehicleDto = {
      plateNumber: 'B1234ABC',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      type: VehicleType.CAR,
      status: VehicleStatus.ACTIVE,
      description: 'Test vehicle',
      customerId: mockCustomerId,
    };

    it('should create vehicle successfully', async () => {
      createVehicleUseCase.execute.mockResolvedValue(mockVehicle);

      const result = await controller.create(createVehicleDto, mockRequest);

      expect(result).toEqual(mockVehicle);
      expect(createVehicleUseCase.execute).toHaveBeenCalledWith({
        ...createVehicleDto,
        customerId: mockCustomerId,
      });
    });

    it('should override customerId with JWT customer ID', async () => {
      const dtoWithDifferentCustomerId = {
        ...createVehicleDto,
        customerId: 'different-customer-id',
      };

      createVehicleUseCase.execute.mockResolvedValue(mockVehicle);

      await controller.create(dtoWithDifferentCustomerId, mockRequest);

      expect(createVehicleUseCase.execute).toHaveBeenCalledWith({
        ...dtoWithDifferentCustomerId,
        customerId: mockCustomerId, // Should use JWT customerId
      });
    });
  });

  describe('findAll', () => {
    it('should return vehicles for authenticated customer', async () => {
      getAllVehiclesUseCase.execute.mockResolvedValue(mockVehicles);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockVehicles);
      expect(getAllVehiclesUseCase.execute).toHaveBeenCalledWith(
        mockCustomerId,
      );
    });
  });

  describe('findByCustomer', () => {
    it('should return vehicles for specific customer', async () => {
      getVehiclesByCustomerUseCase.execute.mockResolvedValue(mockVehicles);

      const result = await controller.findByCustomer(mockCustomerId);

      expect(result).toEqual(mockVehicles);
      expect(getVehiclesByCustomerUseCase.execute).toHaveBeenCalledWith(
        mockCustomerId,
      );
    });
  });

  describe('findOne', () => {
    it('should return vehicle when found', async () => {
      getVehicleByIdUseCase.execute.mockResolvedValue(mockVehicle);

      const result = await controller.findOne(mockVehicleId);

      expect(result).toEqual(mockVehicle);
      expect(getVehicleByIdUseCase.execute).toHaveBeenCalledWith(mockVehicleId);
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      getVehicleByIdUseCase.execute.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Vehicle with ID non-existent-id not found'),
      );
    });
  });

  describe('update', () => {
    const updateVehicleDto: UpdateVehicleDto = {
      brand: 'Honda',
      model: 'Civic',
      status: VehicleStatus.MAINTENANCE,
    };

    it('should update vehicle successfully', async () => {
      const updatedVehicle = { ...mockVehicle, ...updateVehicleDto };
      updateVehicleUseCase.execute.mockResolvedValue(updatedVehicle);

      const result = await controller.update(mockVehicleId, updateVehicleDto);

      expect(result).toEqual(updatedVehicle);
      expect(updateVehicleUseCase.execute).toHaveBeenCalledWith(
        mockVehicleId,
        updateVehicleDto,
      );
    });
  });

  describe('updateLocation', () => {
    const updateLocationDto: UpdateLocationDto = {
      latitude: -6.2088,
      longitude: 106.8456,
    };

    it('should update vehicle location successfully', async () => {
      const updatedVehicle = {
        ...mockVehicle,
        lastLatitude: updateLocationDto.latitude,
        lastLongitude: updateLocationDto.longitude,
      };
      updateVehicleLocationUseCase.execute.mockResolvedValue(updatedVehicle);

      const result = await controller.updateLocation(
        mockVehicleId,
        updateLocationDto,
      );

      expect(result).toEqual(updatedVehicle);
      expect(updateVehicleLocationUseCase.execute).toHaveBeenCalledWith(
        mockVehicleId,
        updateLocationDto.latitude,
        updateLocationDto.longitude,
      );
    });
  });

  describe('remove', () => {
    it('should delete vehicle successfully', async () => {
      deleteVehicleUseCase.execute.mockResolvedValue();

      const result = await controller.remove(mockVehicleId);

      expect(result).toEqual({ message: 'Vehicle deleted successfully' });
      expect(deleteVehicleUseCase.execute).toHaveBeenCalledWith(mockVehicleId);
    });
  });
});
