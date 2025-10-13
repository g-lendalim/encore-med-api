import { IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class WorkingHoursDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0=Sunday .. 6=Saturday

  // "HH:mm" format
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be HH:mm',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:mm' })
  endTime: string;
}
