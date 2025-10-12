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
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // ----------------------------
  // Public self-registration (no JWT)
  // ----------------------------
  @Post('register')
  async selfRegister(@Body() dto: RegisterPatientDto) {
    return this.patientService.createPatient(dto, Role.PATIENT);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPatient(@Body() dto: RegisterPatientDto, @Req() req) {
    const role: Role = req.user?.role;
    return this.patientService.createPatient(dto, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPatients(@Req() req) {
    const role: Role = req.user.role;
    return this.patientService.getPatients(role, req.user.hospitalId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPatient(@Param('id') id: string, @Req() req) {
    return this.patientService.getPatient(id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePatient(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Req() req,
  ) {
    return this.patientService.updatePatient(id, dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePatient(@Param('id') id: string, @Req() req) {
    return this.patientService.deletePatient(id, req.user.role);
  }
}
