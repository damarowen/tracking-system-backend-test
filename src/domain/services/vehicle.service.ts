import { Inject, Injectable } from '@nestjs/common';
import { ICustomerRepository } from '../repositories/customer.repository';
import { IVehicleRepository } from '../repositories/venichle.repository';

@Injectable()
export class VehicleService {
  constructor(
    @Inject('IVehicleRepository')
    private readonly vehicleRepository: IVehicleRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async doesVehicleExist(plateNumber: string): Promise<boolean> {
    const existingVehicle =
      await this.vehicleRepository.findByPlateNumber(plateNumber);
    return existingVehicle !== null;
  }

  async doesCustomerExist(customerId: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(customerId);
    return customer !== null;
  }

  async validateVehicleOwnership(
    vehicleId: string,
    customerId: string,
  ): Promise<boolean> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    return vehicle?.customerId === customerId;
  }
}
