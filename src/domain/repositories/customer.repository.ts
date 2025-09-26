import { Customer } from '../models/customer.entity';

export interface ICustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
}
