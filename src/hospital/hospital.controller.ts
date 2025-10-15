import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Hospitals')
@ApiBearerAuth()
@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hospital with admin' })
  @ApiResponse({ status: 201, description: 'Hospital created successfully' })
  async create(@Body() dto: CreateHospitalDto) {
    return this.hospitalService.createHospital(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all hospitals' })
  @ApiResponse({ status: 200, description: 'List of hospitals' })
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get hospital by ID' })
  @ApiResponse({ status: 200, description: 'Hospital details' })
  findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update hospital name or timezone (Admin only)' })
  @ApiResponse({ status: 200, description: 'Hospital updated successfully' })
  update(
    @Param('id') id: string,
    @Body() data: { name?: string; timezone?: string },
  ) {
    return this.hospitalService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete hospital (Admin only)' })
  @ApiResponse({ status: 200, description: 'Hospital deleted successfully' })
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }
}
