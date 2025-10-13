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
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  slotDuration?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto[];
}
