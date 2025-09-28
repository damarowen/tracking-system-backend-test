import { Customer } from '../models/customer.entity';

export const ICustomerRepository = Symbol('ICustomerRepository');

export interface ICustomerRepository {
  create(customer: Partial<Customer>): Promise<Customer>;
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  update(id: string, customer: Partial<Customer>): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}
