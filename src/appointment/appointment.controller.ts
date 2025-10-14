import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(dto);
  }

  @Patch(':id/confirm')
  @Roles(Role.STAFF, Role.ADMIN)
  async confirm(@Param('id') id: string) {
    return this.appointmentService.confirmAppointment(id);
  }

  @Patch(':id/complete')
  @Roles(Role.STAFF, Role.ADMIN)
  complete(@Param('id') id: string) {
    return this.appointmentService.completeAppointment(id);
  }

  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentService.updateAppointment(id, dto);
  }

  @Delete(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  cancel(@Param('id') id: string) {
    return this.appointmentService.cancelAppointment(id);
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  findAll() {
    return this.appointmentService.getAllAppointments();
  }

  @Get(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  findOne(@Param('id') id: string) {
    return this.appointmentService.getAppointmentById(id);
  }
}
