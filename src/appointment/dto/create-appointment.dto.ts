import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsISO8601, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'cuid-of-hospital' })
  @IsNotEmpty()
  @IsString()
  hospitalId: string;

  @ApiProperty({ example: 'cuid-of-doctor' })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'cuid-of-patient' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({ example: '2025-10-15T14:00:00.000Z' })
  @IsNotEmpty()
  @IsISO8601()
  startAt: string;

  @ApiProperty({ example: '2025-10-15T14:30:00.000Z' })
  @IsNotEmpty()
  @IsISO8601()
  endAt: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.PENDING })
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.PENDING;
}
