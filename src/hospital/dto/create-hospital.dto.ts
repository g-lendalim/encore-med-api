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
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Admin email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Admin full name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Admin password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '1990-05-12', description: 'Admin date of birth' })
  @IsDateString()
  dob: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE, description: 'Admin sex' })
  @IsEnum(Sex)
  sex: Sex;
}

export class CreateHospitalDto {
  @ApiProperty({
    example: 'Sunway Medical Centre',
    description: 'Hospital name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Asia/Kuala_Lumpur',
    description: 'Hospital timezone',
  })
  @IsString()
  timezone: string;

  @ApiProperty({ type: AdminInfo, description: 'Admin information' })
  @ValidateNested()
  @Type(() => AdminInfo)
  admin: AdminInfo;
}
