import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { ConfigModule } from '@nestjs/config';
import { HospitalModule } from './hospital/hospital.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { StaffModule } from './staff/staff.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HospitalModule,
    AuthModule,
    StaffModule,
    PatientModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
