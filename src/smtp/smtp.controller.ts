import { Controller, Post, Body, Param } from '@nestjs/common';
import { SmtpService } from './smtp.service';

@Controller('smtp')
export class SmtpController {
  constructor(private smtpService: SmtpService) {}

  @Post(':hospitalId')
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
