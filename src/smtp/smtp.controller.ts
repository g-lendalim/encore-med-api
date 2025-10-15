import { Controller, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SmtpService } from './smtp.service';

@Controller('smtp')
@ApiTags('SMTP')
export class SmtpController {
  constructor(private smtpService: SmtpService) {}

  @Post(':hospitalId')
  @ApiOperation({ summary: 'Create or update SMTP settings for a hospital' })
  @ApiParam({
    name: 'hospitalId',
    description: 'Hospital ID',
    example: 'hospital_123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        host: { type: 'string', example: 'smtp.gmail.com' },
        port: { type: 'number', example: 587 },
        secure: { type: 'boolean', example: false },
        username: { type: 'string', example: 'user@gmail.com' },
        password: { type: 'string', example: 'password123' },
        fromEmail: { type: 'string', example: 'noreply@hospital.com' },
      },
      required: ['host', 'port', 'secure', 'username', 'password', 'fromEmail'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'SMTP settings upserted successfully',
  })
  async upsert(
    @Param('hospitalId') hospitalId: string,
    @Body()
    data: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
      fromEmail: string;
    },
  ) {
    return this.smtpService.upsertSmtp(hospitalId, data);
  }
}
