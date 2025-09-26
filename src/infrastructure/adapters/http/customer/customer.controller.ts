import { Controller, Post, Body } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../../../app/use-cases/customer/create-customer.use-case';
import { CreateCustomerDto } from '../../../../app/ports/input/create-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(
      createCustomerDto.name,
      createCustomerDto.email,
    );
  }
}
