import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from '../../persistence/postgres/customer.repository';
import { CreateCustomerUseCase } from '../../../../app/use-cases/customer/create-customer.use-case';
import { Customer } from '../../../../domain/models/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [
    CreateCustomerUseCase,
    {
      provide: 'ICustomerRepository', // Token yang sama dengan di use case
      useClass: CustomerRepository,
    },
  ],
})
export class CustomerModule {}
