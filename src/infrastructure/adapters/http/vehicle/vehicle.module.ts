import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { VehicleRepository } from '../../persistence/postgres/vehicle.repository';
import { Vehicle } from '../../../../domain/models/vehicle.entity';
import { Customer } from '../../../../domain/models/customer.entity';
import {
  CreateVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehiclesByCustomerUseCase,
  UpdateVehicleUseCase,
  DeleteVehicleUseCase,
  UpdateVehicleLocationUseCase,
} from '../../../../app/use-cases/vehicle/vehicle.use-case';
import { VehicleService } from '../../../../domain/services/vehicle.service';
import { CustomerRepository } from '../../persistence/postgres/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Customer])],
  controllers: [VehicleController],
  providers: [
    CreateVehicleUseCase,
    GetAllVehiclesUseCase,
    GetVehicleByIdUseCase,
    GetVehiclesByCustomerUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    UpdateVehicleLocationUseCase,
    VehicleService,
    {
      provide: 'IVehicleRepository',
      useClass: VehicleRepository,
    },
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  exports: ['IVehicleRepository', UpdateVehicleLocationUseCase],
})
export class VehicleModule {}
