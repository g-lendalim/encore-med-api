import { Role } from '@prisma/client';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
