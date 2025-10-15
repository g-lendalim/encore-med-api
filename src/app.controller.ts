import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
@ApiTags('App')
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('some-protected-route')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Access a protected route' })
  @ApiResponse({ status: 200, description: 'You accessed a protected route!' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtected() {
    return { message: 'You accessed a protected route!' };
  }

  @Get('tenant')
  @ApiOperation({ summary: 'Get tenant information from request' })
  @ApiResponse({
    status: 200,
    description: 'Tenant info retrieved successfully',
  })
  getTenant(@Req() req: Request) {
    return {
      hospitalId: req.tenant?.hospitalId ?? null,
      timezone: req.tenant?.timezone ?? 'UTC',
    };
  }
}
