import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../domain/models/customer.entity';
import { ICustomerRepository } from '../../../../domain/repositories/customer.repository';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly typeormRepository: Repository<Customer>,
  ) {}

  async create(customer: Customer): Promise<Customer> {
    const newCustomer = this.typeormRepository.create(customer);
    return this.typeormRepository.save(newCustomer);
  }

  async findAll(): Promise<Customer[]> {
    return this.typeormRepository.find();
  }

  async findById(id: string): Promise<Customer | null> {
    return this.typeormRepository.findOneBy({ id });
  }
}
