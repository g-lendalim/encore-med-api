import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  position: string; // doctor, nurse, pharmacist

  @IsDateString()
  dob: string;

  @IsEnum(Sex)
  sex: Sex;
}
