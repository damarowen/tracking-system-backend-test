import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../../../domain/models/vehicle.entity';
import { IVehicleRepository } from '../../../../domain/repositories/venichle.repository';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  private readonly logger = new Logger(VehicleRepository.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly typeormRepository: Repository<Vehicle>,
  ) {}

  async create(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const vehicle = this.typeormRepository.create(vehicleData);
      return await this.typeormRepository.save(vehicle);
    } catch (error) {
      this.logger.error(
        `Failed to create vehicle: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create vehicle');
    }
  }

  async findAll(customerId?: string): Promise<Vehicle[]> {
    try {
      const queryBuilder = this.typeormRepository
        .createQueryBuilder('vehicle')
        .leftJoinAndSelect('vehicle.customer', 'customer');

      if (customerId) {
        queryBuilder.where('vehicle.customerId = :customerId', { customerId });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(
        `Failed to find vehicles: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve vehicles');
    }
  }

  async findById(id: string): Promise<Vehicle | null> {
    try {
      return await this.typeormRepository.findOne({
        where: { id },
        relations: ['customer'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find vehicle by id: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to find vehicle');
    }
  }

  async findByPlateNumber(plateNumber: string): Promise<Vehicle | null> {
    try {
      return await this.typeormRepository.findOne({
        where: { plateNumber },
        relations: ['customer'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find vehicle by plate number: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to find vehicle by plate number',
      );
    }
  }

  async findByCustomerId(customerId: string): Promise<Vehicle[]> {
    try {
      return await this.typeormRepository.find({
        where: { customerId },
        relations: ['customer'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find vehicles by customer: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to find vehicles by customer',
      );
    }
  }

  async update(
    id: string,
    vehicleData: Partial<Vehicle>,
  ): Promise<Vehicle | null> {
    try {
      await this.typeormRepository.update(id, vehicleData);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Failed to update vehicle: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update vehicle');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.typeormRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Failed to delete vehicle: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete vehicle');
    }
  }

  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle | null> {
    try {
      await this.typeormRepository.update(id, {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationUpdate: new Date(),
      });
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Failed to update vehicle location: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to update vehicle location',
      );
    }
  }
}
