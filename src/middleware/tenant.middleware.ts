import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const timezoneHeader = req.header('X-Timezone');
    const hospitalIdHeader = req.header('X-Hospital-Id');

    const tenant = {
      hospitalId: null as string | null,
      timezone: timezoneHeader || 'UTC',
    };

    if (hospitalIdHeader) {
      const hospital = await this.prisma.hospital.findUnique({
        where: { id: hospitalIdHeader },
        select: { id: true, timezone: true },
      });
      if (!hospital) throw new BadRequestException('Invalid X-Hospital-Id');
      tenant.hospitalId = hospital.id;
      tenant.timezone = timezoneHeader || hospital.timezone;
    }

    req.tenant = tenant;
    next();
  }
}
