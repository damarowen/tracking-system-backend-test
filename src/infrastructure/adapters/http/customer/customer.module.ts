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
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../../../common/cache/cache.service';
import * as redisStore from 'cache-manager-redis-store';
import { createClient } from 'redis';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

        // Test Redis connection first
        const testClient = createClient({
          socket: {
            host: redisHost,
            port: redisPort,
          },
        });

        try {
          await testClient.connect();
          console.log(
            `✅ Redis connection successful at ${redisHost}:${redisPort}`,
          );
          await testClient.disconnect();
        } catch (error) {
          console.error(`❌ Redis connection failed:`, error.message);
          throw new Error(
            `Failed to connect to Redis at ${redisHost}:${redisPort}`,
          );
        }

        return {
          store: redisStore,
          host: redisHost,
          port: redisPort,
          ttl: 600,
          max: 1000,
        };
      },
    }),
  ],
  controllers: [CustomerController],
  providers: [
    CreateCustomerUseCase,
    GetAllCustomersUseCase,
    GetCustomerByIdUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    CustomerService,
    CacheService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
})
export class CustomerModule {}
