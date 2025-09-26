import { Inject, Injectable } from '@nestjs/common';
import { ICustomerRepository } from "../../../domain/repositories/customer.repository";
import { Customer } from "../../../domain/models/customer.entity";

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository') // Gunakan token untuk Inversion of Control
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(name: string, email: string): Promise<Customer> {
    const customer = new Customer();
    customer.name = name;
    customer.email = email;
    return this.customerRepository.create(customer);
  }
}
