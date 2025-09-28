import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CreateCustomerUseCase,
  GetAllCustomersUseCase,
  GetCustomerByIdUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
} from '../../../../app/use-cases/customer/customer.use-case';
import {
  CustomerDto,
  UpdateCustomerDto,
} from '../../../../app/ports/input/customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Post()
  create(@Body() createCustomerDto: CustomerDto) {
    return this.createCustomerUseCase.execute(
      createCustomerDto.name,
      createCustomerDto.email,
    );
  }

  @Get()
  findAll() {
    return this.getAllCustomersUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.getCustomerByIdUseCase.execute(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.updateCustomerUseCase.execute(id, updateCustomerDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCustomerUseCase.execute(id);
    return { message: 'Customer deleted successfully' };
  }
}
