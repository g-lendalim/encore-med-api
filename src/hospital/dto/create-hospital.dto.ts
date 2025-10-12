import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  name: string;

  @IsString()
  timezone: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  adminName: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;
}
