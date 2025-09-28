import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../domain/models/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { UserRepository } from '../../persistence/postgres/user.repository';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../../common/jwt/jwt.strategy';
import {
  LoginUseCase,
  RegisterUseCase,
} from '../../../../app/use-cases/auth/auth.use-case';
import { ICustomerRepository } from '../../../../domain/repositories/customer.repository';
import { CustomerRepository } from '../../persistence/postgres/customer.repository';
import { Customer } from '../../../../domain/models/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION_TIME') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: ICustomerRepository, // Use string token to match your use cases
      useClass: CustomerRepository,
    },
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
