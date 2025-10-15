import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class WorkingHoursDto {
  @ApiProperty({
    example: 1,
    description: 'Day of week: 0=Sunday .. 6=Saturday',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be HH:mm',
  })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:mm' })
  endTime: string;
}
