import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  // Create a new hospital
  async createHospital(dto: CreateHospitalDto) {
    // Check for duplicate hospital name
    const existing = await this.prisma.hospital.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Hospital already exists');

    // Use a transaction to ensure all 3 creations happen together
    const result = await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create hospital
      const hospital = await tx.hospital.create({
        data: {
          name: dto.name,
          timezone: dto.timezone,
        },
      });

      // 2️⃣ Create default admin user
      const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
      const adminUser = await tx.user.create({
        data: {
          email: dto.adminEmail,
          name: dto.adminName,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });

      // 3️⃣ Link admin user to hospital staff table
      await tx.staff.create({
        data: {
          hospitalId: hospital.id,
          userId: adminUser.id,
          role: Role.ADMIN,
        },
      });

      // Return both objects so we can shape the final response
      return { hospital, adminUser };
    });

    // 🧾 Return a clean structured response (no password or sensitive info)
    return {
      message: 'Hospital and admin account created successfully',
      hospital: {
        id: result.hospital.id,
        name: result.hospital.name,
        timezone: result.hospital.timezone,
      },
      admin: {
        email: result.adminUser.email,
        name: result.adminUser.name,
      },
    };
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
