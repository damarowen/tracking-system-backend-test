import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum VehicleType {
  CAR = 'car',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  BUS = 'bus',
}

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plateNumber: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.CAR,
  })
  type: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  lastLatitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  lastLongitude?: number;

  @Column({ nullable: true })
  lastLocationUpdate?: Date;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
