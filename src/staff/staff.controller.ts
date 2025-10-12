import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Request } from 'express';

interface TenantRequest extends Request {
  tenant: {
    hospitalId: string;
    timezone: string;
  };
}

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Req() req: TenantRequest, @Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(req.tenant.hospitalId, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Req() req: TenantRequest) {
    return this.staffService.getAllStaff(req.tenant.hospitalId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }
}
