import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class RegisterPatientDto {
  @ApiProperty({
    example: 'patient@example.com',
    description: 'Patient email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of patient' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Password for login',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '1995-08-21', description: 'Date of birth' })
  @IsDateString()
  dob: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE, description: 'Sex of patient' })
  @IsEnum(Sex)
  sex: Sex;

  @ApiProperty({
    example: 'hospitalId123',
    description: 'Hospital ID to register patient to',
  })
  @IsString()
  hospitalId: string;

  @ApiPropertyOptional({ example: 'Peanuts', description: 'Allergies if any' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({
    example: ['Diabetes'],
    description: 'Underlying diseases if any',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  underlyingDiseases?: string[];

  @ApiPropertyOptional({
    example: ['Metformin'],
    description: 'Medications if any',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];
}
