import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { ConfigModule } from '@nestjs/config';
import { HospitalModule } from './hospital/hospital.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { StaffModule } from './staff/staff.module';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PrismaService } from './prisma/prisma.service';
import { SmtpService } from './smtp/smtp.service';
import { SmtpController } from './smtp/smtp.controller';
import { MailService } from './mail.service';

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
    DoctorModule,
    AppointmentModule,
  ],
  controllers: [AppController, SmtpController],
  providers: [PrismaService, SmtpService, MailService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
