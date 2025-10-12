import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Sex } from '@prisma/client';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  underlyingDiseases?: string[];

  @IsOptional()
  medications?: string[];
}
