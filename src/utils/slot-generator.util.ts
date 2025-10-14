import { PrismaClient, AppointmentStatus } from '@prisma/client';
import { DateTime, Interval } from 'luxon';
import { NotFoundException } from '@nestjs/common';

const prisma = new PrismaClient();

export async function generateDoctorSlots(
  doctorId: string,
  dateISO: string,
  timezone: string,
  excludeAppointmentId?: string, // optional param
) {
  // convert date to hospital timezone
  const targetDate = DateTime.fromISO(dateISO, { zone: timezone }).startOf(
    'day',
  );
  const dbDay = targetDate.weekday % 7; // Monday=1 ... Sunday=0

  // 1. Fetch doctor info
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });
  if (!doctor) throw new NotFoundException('Doctor not found');

  const slotMinutes = doctor.slotDuration ?? 30;

  // 2. Fetch working hours
  const workingHours = await prisma.workingHours.findMany({
    where: { doctorId, dayOfWeek: dbDay },
    orderBy: { startTime: 'asc' },
  });
  if (workingHours.length === 0) return [];

  // 3. Fetch existing appointments for the day, excluding the appointment we want to confirm
  const dayStart = targetDate.startOf('day').toJSDate();
  const dayEnd = targetDate.endOf('day').toJSDate();

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startAt: { gte: dayStart, lt: dayEnd },
      status: { not: AppointmentStatus.CANCELLED },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }), // exclude the pending appointment
    },
    select: { startAt: true, endAt: true },
  });

  const appointmentIntervals = appointments.map((appointment) =>
    Interval.fromDateTimes(
      DateTime.fromJSDate(appointment.startAt).setZone(timezone),
      DateTime.fromJSDate(appointment.endAt).setZone(timezone),
    ),
  );

  // 4. Build slot list
  const slots: Array<{ start: string; end: string; available: boolean }> = [];

  for (const workingHour of workingHours) {
    const [sh, sm] = workingHour.startTime.split(':').map(Number);
    const [eh, em] = workingHour.endTime.split(':').map(Number);

    let cursor = targetDate.set({ hour: sh, minute: sm, second: 0 });
    const end = targetDate.set({ hour: eh, minute: em, second: 0 });

    while (cursor < end) {
      const slotEnd = cursor.plus({ minutes: slotMinutes });
      if (slotEnd > end) break;

      const slotInterval = Interval.fromDateTimes(cursor, slotEnd);
      const overlaps = appointmentIntervals.some((appt) =>
        appt.overlaps(slotInterval),
      );

      slots.push({
        start: cursor.toISO() ?? '',
        end: slotEnd.toISO() ?? '',
        available: !overlaps,
      });

      cursor = cursor.plus({ minutes: slotMinutes });
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}
