import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    example: 'Alice Tan',
    description: 'Updated name of staff member',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    minLength: 6,
    description: 'Updated password',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'doctor', description: 'Updated position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    example: '1992-03-15',
    description: 'Updated date of birth',
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({
    enum: Sex,
    example: Sex.MALE,
    description: 'Updated sex of staff member',
  })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;
}
