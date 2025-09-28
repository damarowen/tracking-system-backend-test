import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from '../../persistence/postgres/customer.repository';
import { Customer } from '../../../../domain/models/customer.entity';
import {
  CreateCustomerUseCase,
  GetAllCustomersUseCase,
  GetCustomerByIdUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
} from '../../../../app/use-cases/customer/customer.use-case';
import { CustomerService } from '../../../../domain/services/customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [
    CreateCustomerUseCase,
    GetAllCustomersUseCase,
    GetCustomerByIdUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    CustomerService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
})
export class CustomerModule {}
