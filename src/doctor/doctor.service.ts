import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { WorkingHoursDto } from './dto/working-hours.dto';
import { DateTime, Interval } from 'luxon';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async createDoctor(hospitalId: string, dto: CreateDoctorDto) {
    const slotDuration = dto.slotDuration ?? 30;

    return this.prisma.doctor.create({
      data: {
        hospitalId,
        name: dto.name,
        specialty: dto.specialty,
        slotDuration,
        workingHours: {
          create: dto.workingHours.map((workingHour) => ({
            dayOfWeek: Number(workingHour.dayOfWeek),
            startTime: workingHour.startTime,
            endTime: workingHour.endTime,
          })),
        },
      },
      include: { workingHours: true },
    });
  }

  async findAll(hospitalId: string) {
    return this.prisma.doctor.findMany({
      where: { hospitalId },
      include: { workingHours: true },
    });
  }

  async findOne(hospitalId: string, doctorId: string) {
    const doc = await this.prisma.doctor.findFirst({
      where: { id: doctorId, hospitalId },
      include: { workingHours: true },
    });
    if (!doc) throw new NotFoundException('Doctor not found');
    return doc;
  }

  async update(hospitalId: string, doctorId: string, dto: UpdateDoctorDto) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);
    const { workingHours, ...rest } = dto;

    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ...rest,
        ...(workingHours && {
          workingHours: {
            deleteMany: {}, // remove old working hours
            create: workingHours.map((wh) => ({
              dayOfWeek: Number(wh.dayOfWeek),
              startTime: wh.startTime,
              endTime: wh.endTime,
            })),
          },
        }),
      },
      include: { workingHours: true },
    });
  }

  async remove(hospitalId: string, doctorId: string) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);
    return this.prisma.doctor.delete({ where: { id: doctorId } });
  }

  async addWorkingHours(
    hospitalId: string,
    doctorId: string,
    dto: WorkingHoursDto,
  ) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);

    const [sh, sm] = dto.startTime.split(':').map(Number);
    const [eh, em] = dto.endTime.split(':').map(Number);
    if (sh > eh || (sh === eh && sm >= em)) {
      throw new BadRequestException('startTime must be before endTime');
    }

    return this.prisma.workingHours.create({
      data: {
        doctorId,
        dayOfWeek: Number(dto.dayOfWeek),
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async getWorkingHours(hospitalId: string, doctorId: string) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);
    return this.prisma.workingHours.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateWorkingHours(
    hospitalId: string,
    doctorId: string,
    workingHourId: string,
    dto: WorkingHoursDto,
  ) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);
    const wh = await this.prisma.workingHours.findUnique({
      where: { id: workingHourId },
    });
    if (!wh || wh.doctorId !== doctorId)
      throw new NotFoundException('Working hours not found');
    return this.prisma.workingHours.update({
      where: { id: workingHourId },
      data: {
        dayOfWeek: Number(dto.dayOfWeek),
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async deleteWorkingHours(hospitalId: string, doctorId: string, whId: string) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);
    const wh = await this.prisma.workingHours.findUnique({
      where: { id: whId },
    });
    if (!wh || wh.doctorId !== doctorId)
      throw new NotFoundException('Working hours not found');
    return this.prisma.workingHours.delete({ where: { id: whId } });
  }

  async getAvailability(
    hospitalId: string,
    doctorId: string,
    dateString: string | undefined,
    timezone: string,
  ) {
    await this.ensureDoctorInHospital(hospitalId, doctorId);

    const targetDate = dateString
      ? DateTime.fromISO(dateString, { zone: timezone }).startOf('day')
      : DateTime.now().setZone(timezone).startOf('day');

    const dbDay = targetDate.weekday % 7;

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const workingHours = await this.prisma.workingHours.findMany({
      where: { doctorId, dayOfWeek: dbDay },
      orderBy: { startTime: 'asc' },
    });
    if (workingHours.length === 0) return [];

    const dayStart = targetDate.startOf('day').toJSDate();
    const dayEnd = targetDate.endOf('day').toJSDate();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        startAt: { gte: dayStart, lt: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: { startAt: true, endAt: true },
    });

    const appointmentIntervals = appointments.map((appointment) =>
      Interval.fromDateTimes(
        DateTime.fromJSDate(appointment.startAt).setZone(timezone),
        DateTime.fromJSDate(appointment.endAt).setZone(timezone),
      ),
    );

    const slots: Array<{ start: string; end: string; available: boolean }> = [];

    for (const workingHour of workingHours) {
      const [sh, sm] = workingHour.startTime.split(':').map(Number);
      const [eh, em] = workingHour.endTime.split(':').map(Number);

      let periodStart = targetDate
        .set({ hour: sh, minute: sm })
        .setZone(timezone);
      const periodEnd = targetDate
        .set({ hour: eh, minute: em })
        .setZone(timezone);

      const slotMinutes = doctor.slotDuration ?? 30;

      while (periodStart.plus({ minutes: 0 }) < periodEnd) {
        const slotEnd = periodStart.plus({ minutes: slotMinutes });
        if (slotEnd > periodEnd) break;

        const slotInterval = Interval.fromDateTimes(periodStart, slotEnd);
        const overlaps = appointmentIntervals.some((appointmentInterval) =>
          appointmentInterval.overlaps(slotInterval),
        );

        slots.push({
          start: periodStart.toISO() ?? '',
          end: slotEnd.toISO() ?? '',
          available: !overlaps,
        });

        periodStart = periodStart.plus({ minutes: slotMinutes });
      }
    }

    slots.sort((a, b) => a.start.localeCompare(b.start));
    return slots;
  }

  private async ensureDoctorInHospital(hospitalId: string, doctorId: string) {
    const doc = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doc || doc.hospitalId !== hospitalId) {
      throw new NotFoundException('Doctor not found in hospital');
    }
  }
}
