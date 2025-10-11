import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('some-protected-route')
  getProtected() {
    return { message: '✅ You accessed a protected route!' };
  }
}
