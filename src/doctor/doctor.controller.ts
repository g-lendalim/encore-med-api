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

interface TenantRequest extends Request {
  tenant: { hospitalId: string; timezone: string };
}

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // Create doctor (staff/admin)
  @Post()
  @Roles(Role.STAFF, Role.ADMIN)
  async create(@Req() req: TenantRequest, @Body() dto: CreateDoctorDto) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.createDoctor(hospitalId, dto);
  }

  // List doctors for hospital
  @Get()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async findAll(@Req() req: TenantRequest) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.findAll(hospitalId);
  }

  // Get single doctor (staff/admin)
  @Get(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async findOne(@Req() req: TenantRequest, @Param('id') id: string) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.findOne(hospitalId, id);
  }

  // Update doctor (staff/admin)
  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  async update(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.update(hospitalId, id, dto);
  }

  // Delete doctor (admin)
  @Delete(':id')
  @Roles(Role.STAFF, Role.ADMIN)
  async remove(@Req() req: TenantRequest, @Param('id') id: string) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.remove(hospitalId, id);
  }

  // Create working hours for doctor (staff/admin)
  @Post(':id/working-hours')
  @Roles(Role.STAFF, Role.ADMIN)
  async addWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Body() dto: WorkingHoursDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.addWorkingHours(hospitalId, doctorId, dto);
  }

  // Get working hours for doctor (staff/admin)
  @Get(':id/working-hours')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async getWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.getWorkingHours(hospitalId, doctorId);
  }

  // Update working hours for doctor (staff/admin)
  @Patch(':id/working-hours/:whId')
  @Roles(Role.STAFF, Role.ADMIN)
  async updateWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Param('whId') whId: string,
    @Body() dto: WorkingHoursDto,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.updateWorkingHours(
      hospitalId,
      doctorId,
      whId,
      dto,
    );
  }

  // Delete working hours for doctor (staff/admin)
  @Delete(':id/working-hours/:whId')
  @Roles(Role.STAFF, Role.ADMIN)
  async deleteWorkingHours(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Param('whId') whId: string,
  ) {
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.deleteWorkingHours(hospitalId, doctorId, whId);
  }

  // Get availability slots for a doctor on a given date (staff/admin/patient)
  @Get(':id/availability')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async availability(
    @Req() req: TenantRequest,
    @Param('id') doctorId: string,
    @Query('date') dateString?: string,
  ) {
    const timezone = req.tenant?.timezone || 'UTC';
    const hospitalId = req.tenant?.hospitalId;
    if (!hospitalId) {
      throw new BadRequestException('Missing hospital ID');
    }
    return this.doctorService.getAvailability(
      hospitalId,
      doctorId,
      dateString,
      timezone,
    );
  }
}
