import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { WorkingHoursDto } from './dto/working-hours.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

interface TenantRequest extends Request {
  tenant: { hospitalId: string; timezone: string };
}

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  async create(@Req() req: TenantRequest, @Body() dto: CreateDoctorDto) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.createDoctor(hospitalId, dto);
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Get all doctors for hospital' })
  @ApiResponse({ status: 200, description: 'List of doctors' })
  async findAll(@Req() req: TenantRequest) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.findAll(hospitalId);
  }

  @Get(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Get a doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor details' })
  async findOne(@Req() req: TenantRequest, @Param('id') id: string) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.findOne(hospitalId, id);
  }

  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  async update(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.update(hospitalId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  async remove(@Req() req: TenantRequest, @Param('id') id: string) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.remove(hospitalId, id);
  }

  @Post(':id/working-hours')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Add working hours for a doctor' })
  @ApiResponse({ status: 201, description: 'Working hours added' })
  async addWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Body() dto: WorkingHoursDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.addWorkingHours(hospitalId, doctorId, dto);
  }

  @Get(':id/working-hours')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Get working hours for a doctor' })
  @ApiResponse({ status: 200, description: 'List of working hours' })
  async getWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.getWorkingHours(hospitalId, doctorId);
  }

  @Patch(':id/working-hours/:whId')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Update working hours for a doctor' })
  @ApiResponse({ status: 200, description: 'Working hours updated' })
  async updateWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Param('whId') whId: string,
    @Body() dto: WorkingHoursDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.updateWorkingHours(
      hospitalId,
      doctorId,
      whId,
      dto,
    );
  }

  @Delete(':id/working-hours/:whId')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({ summary: 'Delete working hours for a doctor' })
  @ApiResponse({ status: 200, description: 'Working hours deleted' })
  async deleteWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Param('whId') whId: string,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.deleteWorkingHours(hospitalId, doctorId, whId);
  }

  @Get(':id/availability')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Get doctor availability for a given date' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  async availability(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Query('date') dateString?: string,
  ) {
    const timezone = req.tenant?.timezone || 'UTC';
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) throw new BadRequestException('Missing hospital ID');
    return this.doctorService.getAvailability(
      hospitalId,
      doctorId,
      dateString,
      timezone,
    );
  }
}
