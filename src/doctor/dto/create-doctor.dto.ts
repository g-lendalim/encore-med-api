import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingHoursDto } from './working-hours.dto';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Cardiology' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({
    example:
      'A board-certified cardiologist with over X years of experience specializing in the diagnosis and treatment of complex cardiovascular diseases...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 30, description: 'Slot duration in minutes' })
  @IsInt()
  @Min(5)
  slotDuration: number;

  @ApiProperty({ type: [WorkingHoursDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto[];
}
