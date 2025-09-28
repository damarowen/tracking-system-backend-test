import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository';
import { Customer } from '../../../domain/models/customer.entity';
import { UpdateCustomerDto } from '../../ports/input/customer.dto';
import { CustomerService } from '../../../domain/services/customer.service';

/* Application Logic	*/
@Injectable()
@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly customerService: CustomerService,
  ) {}

  async execute(name: string, email: string): Promise<Customer> {
    const customerExists = await this.customerService.doesCustomerExist(email);

    if (customerExists) {
      throw new ConflictException(
        `Customer with email ${email} already exists.`,
      );
    }
    const customer = new Customer();
    customer.name = name;
    customer.email = email;
    return this.customerRepository.create(customer);
  }
}

@Injectable()
export class GetAllCustomersUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
}

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, updateData: UpdateCustomerDto): Promise<Customer> {
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingCustomer = await this.customerRepository.findByEmail(
        updateData.email,
      );
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    return this.customerRepository.update(id, updateData);
  }
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }
}
