import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class GetSlotsDto {
  @IsString()
  doctorId: string;

  @IsOptional()
  @IsISO8601()
  date?: string;
}
