import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Role, User, Patient } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  // Create a patient (admin or self)
  async createPatient(dto: RegisterPatientDto, creatorRole?: Role) {
    // Only enforce role check if creatorRole is provided (admin route)
    if (
      creatorRole &&
      creatorRole !== Role.ADMIN &&
      creatorRole !== Role.PATIENT
    ) {
      throw new ForbiddenException('Not allowed to create patient');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        dob: new Date(dto.dob),
        sex: dto.sex,
        role: Role.PATIENT, // Always assign PATIENT
        patient: {
          create: {
            hospitalId: dto.hospitalId,
            allergies: dto.allergies || '',
            underlyingDiseases: dto.underlyingDiseases || [],
            medications: dto.medications || [],
          },
        },
      },
      include: { patient: true },
    });

    return user;
  }

  // Get all patients (admin only)
  async getPatients(requesterRole: Role, hospitalId?: string) {
    if (requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all patients');
    }

    return this.prisma.patient.findMany({
      where: hospitalId ? { hospitalId } : {},
      include: { user: true, hospital: true },
    });
  }

  // Get one patient
  async getPatient(patientId: string, requesterRole: Role) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true, hospital: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Optional: restrict access if needed
    if (requesterRole !== Role.ADMIN) {
      // e.g., only allow the patient themselves to view their info
    }

    return patient;
  }

  // Update patient
  async updatePatient(patientId: string, dto: UpdatePatientDto, role: Role) {
    // RBAC: only admin can update others
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update patient info');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const userUpdates: Partial<User> = {};
    if (dto.name) userUpdates.name = dto.name;
    if (dto.dob) userUpdates.dob = new Date(dto.dob);
    if (dto.sex) userUpdates.sex = dto.sex;

    const patientUpdates: Partial<Patient> = {};
    if (dto.allergies) patientUpdates.allergies = dto.allergies;
    if (dto.underlyingDiseases)
      patientUpdates.underlyingDiseases = dto.underlyingDiseases;
    if (dto.medications) patientUpdates.medications = dto.medications;

    await this.prisma.user.update({
      where: { id: patient.userId },
      data: userUpdates,
    });
    await this.prisma.patient.update({
      where: { id: patientId },
      data: patientUpdates,
    });

    return this.getPatient(patientId, role);
  }

  // Delete patient
  async deletePatient(patientId: string, role: Role) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete patients');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    await this.prisma.patient.delete({ where: { id: patientId } });
    await this.prisma.user.delete({ where: { id: patient.userId } });

    return { message: 'Patient deleted successfully' };
  }
}
