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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

interface TenantRequest extends Request {
  tenant: { hospitalId: string; timezone: string };
}

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new staff member (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
  })
  async create(@Req() req: TenantRequest, @Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(req.tenant.hospitalId, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all staff members for a hospital (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'List of staff members' })
  async findAll(@Req() req: TenantRequest) {
    return this.staffService.getAllStaff(req.tenant.hospitalId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a staff member (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a staff member (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }
}
