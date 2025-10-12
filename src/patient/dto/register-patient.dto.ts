import {
  IsEmail,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class RegisterPatientDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsDateString()
  dob: string;

  @IsEnum(Sex)
  sex: Sex;

  @IsString()
  hospitalId: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  underlyingDiseases?: string[];

  @IsOptional()
  medications?: string[];
}
