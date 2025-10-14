import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private prisma: PrismaService) {}

  /** Automatically use hospital’s SMTP if configured */
  async sendMail(
    hospitalId: string,
    to: string,
    subject: string,
    html: string,
  ): Promise<SentMessageInfo> {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: { smtp: true },
    });

    let transporter: Transporter<SentMessageInfo>;

    if (hospital?.smtp) {
      transporter = nodemailer.createTransport({
        host: hospital.smtp.host,
        port: hospital.smtp.port,
        secure: hospital.smtp.secure,
        auth: {
          user: hospital.smtp.username,
          pass: hospital.smtp.password,
        },
      }) as Transporter<SentMessageInfo>;
    } else {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'jasmin18@ethereal.email',
          pass: 'ffRmexaq6Xpp5zPAFa',
        },
      }) as Transporter<SentMessageInfo>;
    }

    const info = (await transporter.sendMail({
      from: hospital?.smtp?.fromEmail ?? '"Default" <no-reply@example.com>',
      to,
      subject,
      html,
    })) as SentMessageInfo;

    Logger.log(`📨 Email sent to ${to}`);
    if ('messageId' in info) {
      Logger.log(`Message ID: ${String(info.messageId)}`);
    }

    return info;
  }
}
