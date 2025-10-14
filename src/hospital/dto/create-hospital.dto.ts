import {
  IsEmail,
  IsString,
  IsDateString,
  IsEnum,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Sex } from '@prisma/client';

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

class AdminInfo {
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
}

export class CreateHospitalDto {
  @IsString()
  name: string;

  @IsString()
  timezone: string;

  @ValidateNested()
  @Type(() => AdminInfo)
  admin: AdminInfo;
}
