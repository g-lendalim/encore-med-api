import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
  constructor(private prisma: PrismaService) {}

  /** Get or create a transporter for a specific hospital */
  async getTransporter(hospitalId: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: { smtp: true },
    });

    if (!hospital) throw new NotFoundException('Hospital not found');
    if (!hospital.smtp) throw new NotFoundException('SMTP not configured');

    const { host, port, secure, username, password } = hospital.smtp;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: username, pass: password },
    });
  }

  /** Update or create hospital SMTP settings */
  async upsertSmtp(
    hospitalId: string,
    data: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
      fromEmail: string;
    },
  ) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospital) throw new NotFoundException('Hospital not found');

    if (hospital.smtpId) {
      return this.prisma.smtp.update({
        where: { id: hospital.smtpId },
        data,
      });
    } else {
      const smtp = await this.prisma.smtp.create({ data });
      return this.prisma.hospital.update({
        where: { id: hospitalId },
        data: { smtpId: smtp.id },
      });
    }
  }
}
