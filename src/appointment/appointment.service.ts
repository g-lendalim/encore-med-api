import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { generateDoctorSlots } from '../utils/slot-generator.util';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * STEP 1: Create appointment → Status: PENDING
   * Validate slot availability before creation.
   */
  async createAppointment(createDto: CreateAppointmentDto) {
    const { hospitalId, doctorId, patientId, startAt, endAt } = createDto;

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { hospital: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const timezone = doctor.hospital?.timezone ?? 'Asia/Kuala_Lumpur';
    const dateISO = startAt.split('T')[0];

    const slots = await generateDoctorSlots(doctorId, dateISO, timezone);

    // Normalize to UTC timestamps for comparison
    const slotAvailable = slots.some((slot) => {
      const slotStartUTC = new Date(slot.start).getTime();
      const slotEndUTC = new Date(slot.end).getTime();
      return (
        slotStartUTC === new Date(startAt).getTime() &&
        slotEndUTC === new Date(endAt).getTime() &&
        slot.available
      );
    });

    if (!slotAvailable) {
      throw new BadRequestException('Slot is not available');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        hospitalId,
        doctorId,
        patientId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: AppointmentStatus.PENDING,
      },
    });

    return {
      message: 'Appointment created and pending confirmation',
      data: appointment,
    };
  }

  /**
   * STEP 2: Confirm appointment → Only if slot is still available.
   * Status can only transition from PENDING → CONFIRMED.
   */
  async confirmAppointment(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: { include: { hospital: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new ForbiddenException(
        'Only pending appointments can be confirmed',
      );
    }

    const timezone =
      appointment.doctor.hospital?.timezone ?? 'Asia/Kuala_Lumpur';
    const dateISO = appointment.startAt.toISOString().split('T')[0];

    // Pass the appointment ID to exclude it from slot conflict check
    const slots = await generateDoctorSlots(
      appointment.doctorId,
      dateISO,
      timezone,
      appointment.id,
    );

    const apptStartUTC = new Date(appointment.startAt).getTime();
    const apptEndUTC = new Date(appointment.endAt).getTime();

    const matchingSlot = slots.find((slot) => {
      const slotStartUTC = new Date(slot.start).getTime();
      const slotEndUTC = new Date(slot.end).getTime();
      return (
        slotStartUTC === apptStartUTC &&
        slotEndUTC === apptEndUTC &&
        slot.available
      );
    });

    if (!matchingSlot) {
      console.warn('⚠️ Slot not available at confirmation time:', {
        apptStartUTC,
        apptEndUTC,
      });
      throw new BadRequestException('Doctor slot is no longer available');
    }

    const confirmed = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
    });

    return {
      message: '✅ Appointment confirmed successfully',
      data: confirmed,
    };
  }

  /**
   * STEP 3: Cancel appointment → PENDING / CONFIRMED → CANCELLED.
   */
  async cancelAppointment(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const cancelled = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return {
      message: 'Appointment cancelled successfully',
      data: cancelled,
    };
  }

  /**
   * STEP 4: Mark appointment as completed → Only after endAt.
   * CONFIRMED → COMPLETED.
   */
  async completeAppointment(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new ForbiddenException(
        'Only confirmed appointments can be completed',
      );
    }

    const now = new Date();
    if (appointment.endAt > now) {
      throw new BadRequestException('Appointment has not ended yet');
    }

    const completed = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.COMPLETED },
    });

    return {
      message: 'Appointment marked as completed',
      data: completed,
    };
  }

  /**
   * Update appointment → Validate slot if time/doctor changes.
   */
  async updateAppointment(id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: { include: { hospital: true } } },
    });
    if (!existing) throw new NotFoundException('Appointment not found');

    const { doctorId, startAt, endAt, status } = dto;

    const timezone = existing.doctor.hospital?.timezone ?? 'Asia/Kuala_Lumpur';

    // Validate slot if doctor or time changes
    if (doctorId || startAt || endAt) {
      const newDoctorId = doctorId ?? existing.doctorId;
      const newStartAt = startAt ?? existing.startAt.toISOString();
      const newEndAt = endAt ?? existing.endAt.toISOString();

      const dateISO = newStartAt.split('T')[0];
      const slots = await generateDoctorSlots(newDoctorId, dateISO, timezone);

      const validSlot = slots.find((s) => {
        const slotStartUTC = new Date(s.start).getTime();
        const slotEndUTC = new Date(s.end).getTime();
        return (
          slotStartUTC === new Date(newStartAt).getTime() &&
          slotEndUTC === new Date(newEndAt).getTime() &&
          s.available
        );
      });

      if (!validSlot) {
        throw new BadRequestException('Selected slot is not available');
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        doctorId,
        startAt: startAt ? new Date(startAt) : undefined,
        endAt: endAt ? new Date(endAt) : undefined,
        status,
      },
    });

    return {
      message: 'Appointment updated successfully',
      data: updated,
    };
  }

  /**
   * Get all appointments (Admin view)
   */
  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: { doctor: true, patient: true, hospital: true },
    });
  }

  /**
   * Get a specific appointment by ID.
   */
  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true, hospital: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }
}
