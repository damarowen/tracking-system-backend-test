import { Inject, Injectable } from '@nestjs/common';
import { ICustomerRepository } from '../repositories/customer.repository';

/* Business Logic	 */
@Injectable()
export class CustomerService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  /**
   * Memeriksa apakah seorang pelanggan sudah ada berdasarkan email.
   * Ini adalah contoh logika bisnis murni.
   * @param email Email yang akan diperiksa.
   * @returns {Promise<boolean>} True jika email sudah ada, false jika belum.
   */
  async doesCustomerExist(email: string): Promise<boolean> {
    const existingCustomer = await this.customerRepository.findByEmail(email);
    return existingCustomer !== null;
  }
}
