import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'refresh-token-value' })
  @IsString()
  refresh_token: string;
}
