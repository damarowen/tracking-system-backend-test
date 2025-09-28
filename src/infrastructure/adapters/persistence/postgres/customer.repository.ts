import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../domain/models/customer.entity';
import { ICustomerRepository } from '../../../../domain/repositories/customer.repository';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  private readonly logger = new Logger(CustomerRepository.name);

  constructor(
    @InjectRepository(Customer)
    private readonly typeormRepository: Repository<Customer>,
  ) {}

  async create(customerData: Partial<Customer>): Promise<Customer> {
    try {
      const customer = this.typeormRepository.create(customerData);
      return await this.typeormRepository.save(customer);
    } catch (error) {
      this.logger.error(
        `Failed to create customer: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      return await this.typeormRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(
        `Failed to find customer by email: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to find customer by email',
      );
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      return await this.typeormRepository.find();
    } catch (error) {
      this.logger.error(
        `Failed to find all customers: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve customers');
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await this.typeormRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        `Failed to find customer by id: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to find customer');
    }
  }

  async update(
    id: string,
    customerData: Partial<Customer>,
  ): Promise<Customer | null> {
    try {
      await this.typeormRepository.update(id, customerData);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Failed to update customer: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update customer');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.typeormRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Failed to delete customer: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete customer');
    }
  }
}
