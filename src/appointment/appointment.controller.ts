import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtUser } from 'src/auth/type';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async create(@Body() dto: CreateAppointmentDto) {
    return await this.appointmentService.createAppointment(dto);
  }

  @Patch(':id/confirm')
  @Roles(Role.STAFF, Role.ADMIN)
  async confirm(@Param('id') id: string) {
    return await this.appointmentService.confirmAppointment(id);
  }

  @Patch(':id/complete')
  @Roles(Role.STAFF, Role.ADMIN)
  async complete(@Param('id') id: string) {
    return await this.appointmentService.completeAppointment(id);
  }

  @Patch(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return await this.appointmentService.updateAppointment(id, dto);
  }

  @Delete(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async cancel(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    if (req.user.role === Role.PATIENT) {
      return await this.appointmentService.cancelAppointmentForPatient(
        id,
        req.user.id,
      );
    }
    return await this.appointmentService.cancelAppointment(id);
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async findAll(@Req() req: Request & { user: JwtUser }) {
    if (req.user.role === Role.PATIENT) {
      return await this.appointmentService.getAppointmentsByPatient(
        req.user.id,
      );
    }
    return await this.appointmentService.getAllAppointments();
  }

  @Get(':id')
  @Roles(Role.STAFF, Role.ADMIN, Role.PATIENT)
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    if (req.user.role === Role.PATIENT) {
      return await this.appointmentService.getAppointmentByIdForPatient(
        id,
        req.user.id,
      );
    }
    return await this.appointmentService.getAppointmentById(id);
  }

  @Get('my/upcoming')
  @Roles(Role.PATIENT)
  async myUpcomingAppointments(@Req() req: Request & { user: JwtUser }) {
    return await this.appointmentService.getUpcomingAppointments(req.user.id);
  }
}
