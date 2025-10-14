import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail.service';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron('0 9 * * *') // every day at 9AM server time
  async sendAppointmentReminders() {
    const tomorrowStart = startOfDay(addDays(new Date(), 1));
    const tomorrowEnd = endOfDay(addDays(new Date(), 1));

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startAt: { gte: tomorrowStart, lte: tomorrowEnd },
        status: 'CONFIRMED',
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        hospital: true,
      },
    });

    for (const appt of appointments) {
      const patientEmail = appt.patient?.user?.email;
      const patientName = appt.patient?.user?.name;

      if (patientEmail) {
        await this.mailService.sendMail(
          appt.hospitalId,
          patientEmail,
          'Appointment Reminder',
          `<p>Reminder: Dear ${patientName}, you have an appointment tomorrow at ${format(
            appt.startAt,
            'PPpp',
          )} with Dr. ${appt.doctor.name}</p>`,
        );
        Logger.log(`Reminder sent to ${patientEmail}`);
      }
    }
  }
}
