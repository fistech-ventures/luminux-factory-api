import { ApiProperty } from '@nestjs/swagger';
import { UniqueValidatorPipe } from '@src/app/pipes/uniqueValidator.pipe';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidationArguments,
} from 'class-validator';
import { FindOptionsWhere } from 'typeorm';
import { Employee } from '../entities/employee.entity';

export class CreateEmployeeDTO {
  @ApiProperty({ type: String, required: true, example: 'Nahid Hasan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ type: String, required: true, example: 'EMP-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Validate(UniqueValidatorPipe<Employee>, [
    Employee,
    (args: ValidationArguments): FindOptionsWhere<Employee> => {
      const dto = args.object as CreateEmployeeDTO;
      return { employeeId: dto.employeeId };
    },
  ])
  employeeId: string;

  @ApiProperty({ type: String, required: true, example: '01700000000' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ type: String, required: false, example: 'nahid@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ type: String, required: false, example: 'Sales Executive' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @IsOptional()
  readonly createdBy?: any;
}
