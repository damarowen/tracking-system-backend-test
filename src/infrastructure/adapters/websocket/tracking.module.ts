import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingGateway } from './tracking.gateway';
import { Vehicle } from '../../../domain/models/vehicle.entity';
import { UpdateVehicleLocationUseCase } from '../../../app/use-cases/vehicle/vehicle.use-case';
import { VehicleRepository } from '../persistence/postgres/vehicle.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [
    TrackingGateway,
    UpdateVehicleLocationUseCase,
    {
      provide: 'IVehicleRepository',
      useClass: VehicleRepository,
    },
  ],
  exports: [TrackingGateway],
})
export class TrackingModule {}
