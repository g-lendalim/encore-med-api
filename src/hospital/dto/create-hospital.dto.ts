import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '1990-05-12' })
  @IsDateString()
  dob: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE })
  @IsEnum(Sex)
  sex: Sex;
}

export class CreateHospitalDto {
  @ApiProperty({ example: 'Sunway Medical Centre' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Asia/Kuala_Lumpur' })
  @IsString()
  timezone: string;

  @ApiProperty({ type: AdminInfo })
  @ValidateNested()
  @Type(() => AdminInfo)
  admin: AdminInfo;
}
