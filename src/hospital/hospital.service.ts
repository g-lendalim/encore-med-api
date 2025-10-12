import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, Hospital, User } from '@prisma/client';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  async createHospital(dto: CreateHospitalDto) {
    try {
      // Check for duplicate hospital
      const existing = await this.prisma.hospital.findFirst({
        where: { name: dto.name },
      });
      if (existing) throw new ConflictException('Hospital already exists');

      const hashedPassword = await bcrypt.hash(dto.admin.password, 10);

      // Create hospital + admin together
      const hospital = await this.prisma.hospital.create({
        data: {
          name: dto.name,
          timezone: dto.timezone,
          admin: {
            create: {
              email: dto.admin.email,
              name: dto.admin.name,
              password: hashedPassword,
              role: Role.ADMIN,
              dob: new Date(dto.admin.dob),
              sex: dto.admin.sex,
            },
          },
        },
        include: {
          admin: true,
        },
      });

      const createdHospital = hospital as Hospital & { admin: User };

      await this.prisma.staff.create({
        data: {
          hospitalId: createdHospital.id,
          userId: createdHospital.admin.id,
          position: 'Admin',
        },
      });

      return {
        message: 'Hospital and admin account created successfully',
        hospital: {
          id: createdHospital.id,
          name: createdHospital.name,
          timezone: createdHospital.timezone,
        },
        admin: {
          id: createdHospital.admin.id,
          email: createdHospital.admin.email,
          name: createdHospital.admin.name,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.code, error.meta);
        throw new InternalServerErrorException('Database error occurred.');
      }

      if (error instanceof Error) {
        console.error('Unexpected error:', error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong creating the hospital.',
      );
    }
  }

  // Get all hospitals
  async findAll() {
    return this.prisma.hospital.findMany();
  }

  // Get one hospital by ID
  async findOne(id: string) {
    return this.prisma.hospital.findUnique({ where: { id } });
  }

  // Update hospital details
  async update(id: string, data: { name?: string; timezone?: string }) {
    return this.prisma.hospital.update({
      where: { id },
      data,
    });
  }

  // Delete a hospital
  async remove(id: string) {
    return this.prisma.hospital.delete({ where: { id } });
  }
}
