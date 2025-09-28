import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Vehicle } from '../../../domain/models/vehicle.entity';
import { UpdateVehicleDto } from '../../ports/input/vehicle.dto';
import { VehicleService } from '../../../domain/services/vehicle.service';
import { IVehicleRepository } from '../../../domain/repositories/venichle.repository';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
    private readonly vehicleService: VehicleService,
  ) {}

  async execute(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    // Check if customer exists
    const customerExists = await this.vehicleService.doesCustomerExist(
      vehicleData.customerId,
    );
    if (!customerExists) {
      throw new NotFoundException(
        `Customer with ID ${vehicleData.customerId} not found`,
      );
    }

    // Check if plate number already exists
    const vehicleExists = await this.vehicleService.doesVehicleExist(
      vehicleData.plateNumber,
    );
    if (vehicleExists) {
      throw new ConflictException(
        `Vehicle with plate number ${vehicleData.plateNumber} already exists`,
      );
    }

    const vehicle = new Vehicle();
    Object.assign(vehicle, vehicleData);

    return this.vehicleRepository.create(vehicle);
  }
}

@Injectable()
export class GetAllVehiclesUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(customerId?: string): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll(customerId);
  }
}

@Injectable()
export class GetVehicleByIdUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string): Promise<Vehicle | null> {
    return this.vehicleRepository.findById(id);
  }
}

@Injectable()
export class GetVehiclesByCustomerUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(customerId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.findByCustomerId(customerId);
  }
}

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
    private readonly vehicleService: VehicleService,
  ) {}

  async execute(id: string, updateData: UpdateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Check if plate number is being updated and if it already exists
    if (
      updateData.plateNumber &&
      updateData.plateNumber !== existingVehicle.plateNumber
    ) {
      const plateExists = await this.vehicleService.doesVehicleExist(
        updateData.plateNumber,
      );
      if (plateExists) {
        throw new ConflictException(
          `Vehicle with plate number ${updateData.plateNumber} already exists`,
        );
      }
    }

    return this.vehicleRepository.update(id, updateData);
  }
}

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    await this.vehicleRepository.delete(id);
  }
}

@Injectable()
export class UpdateVehicleLocationUseCase {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return this.vehicleRepository.updateLocation(id, latitude, longitude);
  }
}
