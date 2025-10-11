import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HospitalModule } from './hospital/hospital.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HospitalModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
