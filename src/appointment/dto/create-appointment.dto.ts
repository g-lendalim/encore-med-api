import { IsNotEmpty, IsString, IsISO8601 } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  hospitalId: string;

  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @IsNotEmpty()
  @IsString()
  patientId: string;

  @IsNotEmpty()
  @IsISO8601()
  startAt: string;

  @IsNotEmpty()
  @IsISO8601()
  endAt: string;
}
