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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehiclesByCustomerUseCase,
  UpdateVehicleUseCase,
  DeleteVehicleUseCase,
  UpdateVehicleLocationUseCase,
} from '../../../../app/use-cases/vehicle/vehicle.use-case';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  UpdateLocationDto,
} from '../../../../app/ports/input/vehicle.dto';
import { JwtAuthGuard } from '../../../common/jwt/jwt-auth.guard';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getAllVehiclesUseCase: GetAllVehiclesUseCase,
    private readonly getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private readonly getVehiclesByCustomerUseCase: GetVehiclesByCustomerUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly updateVehicleLocationUseCase: UpdateVehicleLocationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createVehicleDto: CreateVehicleDto, @Request() req) {
    // Extract customer ID from JWT and override DTO customerId
    const vehicleData = {
      ...createVehicleDto,
      customerId: req.user.customerId, // JWT payload contains user ID in 'sub' field
    };
    return this.createVehicleUseCase.execute(vehicleData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'List of vehicles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter vehicles by customer ID',
    type: 'string',
  })
  findAll(@Request() req) {
    const customerId = req.user.customerId;
    return this.getAllVehiclesUseCase.execute(customerId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get vehicles by customer ID' })
  @ApiResponse({ status: 200, description: 'List of customer vehicles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer UUID',
    type: 'string',
    format: 'uuid',
  })
  findByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.getVehiclesByCustomerUseCase.execute(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Vehicle UUID',
    type: 'string',
    format: 'uuid',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const vehicle = await this.getVehicleByIdUseCase.execute(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle information' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Vehicle UUID',
    type: 'string',
    format: 'uuid',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.updateVehicleUseCase.execute(id, updateVehicleDto);
  }

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update vehicle location' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle location updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Vehicle UUID',
    type: 'string',
    format: 'uuid',
  })
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.updateVehicleLocationUseCase.execute(
      id,
      updateLocationDto.latitude,
      updateLocationDto.longitude,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Vehicle UUID',
    type: 'string',
    format: 'uuid',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteVehicleUseCase.execute(id);
    return { message: 'Vehicle deleted successfully' };
  }
}
