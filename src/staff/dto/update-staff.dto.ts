import {
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;
}
