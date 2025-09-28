import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../domain/models/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { RegisterUserDto } from '../../ports/input/auth.dto';
import { Customer } from 'src/domain/models/customer.entity';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      customerId: user.customerId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(ICustomerRepository)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(dto: RegisterUserDto): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const customer = new Customer();
    customer.name = dto.name || dto.email.split('@')[0]; // Use name or extract from email
    customer.email = dto.email;
    const savedCustomer = await this.customerRepository.create(customer);

    const user = new User();
    user.email = dto.email;
    user.passwordHash = dto.password;
    user.customer = savedCustomer;
    user.customerId = savedCustomer.id;

    const newUser = await this.userRepository.create(user);
    const { passwordHash, ...result } = newUser;
    return result;
  }
}
