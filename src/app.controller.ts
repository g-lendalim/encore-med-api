import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('some-protected-route')
  getProtected() {
    return { message: 'You accessed a protected route!' };
  }

  @Get('tenant')
  getTenant(@Req() req: Request) {
    return {
      hospitalId: req.tenant?.hospitalId ?? null,
      timezone: req.tenant?.timezone ?? 'UTC',
    };
  }
}
