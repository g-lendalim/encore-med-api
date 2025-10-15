import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role, Sex } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({
    example: 'staff@example.com',
    description: 'Staff email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Alice Tan',
    description: 'Full name of the staff member',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Staff password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'nurse',
    description: 'Position of staff member in hospital',
  })
  @IsString()
  position: string;

  @ApiProperty({
    example: '1992-03-15',
    description: 'Date of birth of staff member',
  })
  @IsDateString()
  dob: string;

  @ApiProperty({
    enum: Sex,
    example: Sex.FEMALE,
    description: 'Sex of staff member',
  })
  @IsEnum(Sex)
  sex: Sex;

  @ApiProperty({
    enum: Role,
    example: Role.STAFF,
    description: 'Role of staff member',
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
