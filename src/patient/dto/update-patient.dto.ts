import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class UpdatePatientDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Updated name of patient',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '1995-08-21',
    description: 'Updated date of birth',
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({
    enum: Sex,
    example: Sex.MALE,
    description: 'Updated sex of patient',
  })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiPropertyOptional({ example: 'Peanuts', description: 'Updated allergies' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({
    example: ['Diabetes'],
    description: 'Updated underlying diseases',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  underlyingDiseases?: string[];

  @ApiPropertyOptional({
    example: ['Metformin'],
    description: 'Updated medications',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];
}
