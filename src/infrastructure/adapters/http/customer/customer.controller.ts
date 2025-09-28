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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import { JwtAuthGuard } from '../../../common/jwt/jwt-auth.guard';
import { CacheService } from '../../../common/cache/cache.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async findAll() {
    const cacheKey = 'customers:all';

    let customers = await this.cacheService.get<any>(cacheKey);
    if (!customers) {
      customers = await this.getAllCustomersUseCase.execute();
      await this.cacheService.set(cacheKey, customers, 600); // 10 minutes
    }

    return customers;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.getCustomerByIdUseCase.execute(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.updateCustomerUseCase.execute(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCustomerUseCase.execute(id);
    return { message: 'Customer deleted successfully' };
  }
}
