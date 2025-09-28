import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VehicleStatus,
  VehicleType,
} from '../../../domain/models/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'B1234ABC',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({
    description: 'Vehicle brand',
    example: 'Toyota',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: 'Vehicle manufacturing year',
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    type: Number,
  })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({
    description: 'Vehicle type',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiPropertyOptional({
    description: 'Vehicle status',
    enum: VehicleStatus,
    example: VehicleStatus.ACTIVE,
    default: VehicleStatus.ACTIVE,
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiPropertyOptional({
    description: 'Vehicle description',
    example: 'Blue sedan with leather seats',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Customer UUID who owns the vehicle',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String,
  })
  @IsUUID()
  @IsOptional()
  customerId: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    description: 'Vehicle plate number',
    example: 'B1234ABC',
    type: String,
  })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional({
    description: 'Vehicle brand',
    example: 'Toyota',
    type: String,
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Vehicle model',
    example: 'Camry',
    type: String,
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({
    description: 'Vehicle manufacturing year',
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    type: Number,
  })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({
    description: 'Vehicle type',
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @ApiPropertyOptional({
    description: 'Vehicle status',
    enum: VehicleStatus,
    example: VehicleStatus.ACTIVE,
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiPropertyOptional({
    description: 'Vehicle description',
    example: 'Blue sedan with leather seats',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: -6.2088,
    minimum: -90,
    maximum: 90,
    type: Number,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.8456,
    minimum: -180,
    maximum: 180,
    type: Number,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
