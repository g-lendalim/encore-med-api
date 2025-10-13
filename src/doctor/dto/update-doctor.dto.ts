import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkingHoursDto } from './working-hours.dto';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  name?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto[];
}
