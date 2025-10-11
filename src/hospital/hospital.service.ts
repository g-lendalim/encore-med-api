import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  // Create a new hospital
  async create(data: { name: string; timezone: string }) {
    return this.prisma.hospital.create({ data });
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
