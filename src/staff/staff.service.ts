import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async createStaff(hospitalId: string, data: CreateStaffDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ForbiddenException('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userWithStaff = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        dob: new Date(data.dob),
        sex: data.sex,
        role: Role.STAFF,
        staff: {
          create: {
            hospitalId,
            position: data.position, // doctor, nurse, pharmacist, etc.
          },
        },
      },
      include: {
        staff: true,
      },
    });

    return userWithStaff;
  }

  async getAllStaff(hospitalId: string) {
    return this.prisma.staff.findMany({
      where: { hospitalId },
      include: { user: true },
    });
  }

  async updateStaff(staffId: string, data: UpdateStaffDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) throw new NotFoundException('Staff not found');

    const updates: Promise<any>[] = [];

    // Update user data (name/password/dob/sex)
    const userData: Partial<User> = {};
    if (data.name) userData.name = data.name;
    if (data.password) userData.password = await bcrypt.hash(data.password, 10);
    if (data.dob) userData.dob = new Date(data.dob);
    if (data.sex) userData.sex = data.sex;

    if (Object.keys(userData).length > 0) {
      updates.push(
        this.prisma.user.update({
          where: { id: staff.userId },
          data: userData,
        }),
      );
    }

    // Update position if provided
    if (data.position) {
      updates.push(
        this.prisma.staff.update({
          where: { id: staffId },
          data: { position: data.position },
        }),
      );
    }

    await Promise.all(updates);

    return this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });
  }

  async deleteStaff(staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    // Delete both Staff + linked User
    await this.prisma.staff.delete({ where: { id: staffId } });
    await this.prisma.user.delete({ where: { id: staff.userId } });

    return { message: 'Staff deleted successfully' };
  }
}
