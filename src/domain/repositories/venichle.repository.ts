import { Vehicle } from '../models/vehicle.entity';

export const IVehicleRepository = Symbol('IVehicleRepository');

export interface IVehicleRepository {
  create(vehicle: Partial<Vehicle>): Promise<Vehicle>;
  findAll(customerId?: string): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByCustomerId(customerId: string): Promise<Vehicle[]>;
  findByPlateNumber(plateNumber: string): Promise<Vehicle | null>;
  update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null>;
  delete(id: string): Promise<boolean>;
  updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle | null>;
}
