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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

interface JwtRequest extends Request {
  user: {
    id: string;
    role: Role;
    hospitalId?: string;
  };
}

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // ----------------------------
  // Public self-registration (no JWT)
  // ----------------------------
  @Post('register')
  @ApiOperation({ summary: 'Patient self-registration' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  async selfRegister(@Body() dto: RegisterPatientDto) {
    return this.patientService.createPatient(dto, Role.PATIENT);
  }

  // ----------------------------
  // Protected routes (JWT)
  // ----------------------------
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a patient (staff/admin)' })
  async createPatient(@Body() dto: RegisterPatientDto, @Req() req: JwtRequest) {
    return this.patientService.createPatient(dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List patients' })
  async getPatients(@Req() req: JwtRequest) {
    return this.patientService.getPatients(req.user.role, req.user.hospitalId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient by ID' })
  async getPatient(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.patientService.getPatient(id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient info' })
  async updatePatient(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Req() req: JwtRequest,
  ) {
    return this.patientService.updatePatient(id, dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete patient' })
  async deletePatient(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.patientService.deletePatient(id, req.user.role);
  }
}
