import {
  IsEmail,
  IsString,
  IsDateString,
  IsEnum,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
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

  @IsEnum(SexEnum)
  sex: SexEnum;
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
