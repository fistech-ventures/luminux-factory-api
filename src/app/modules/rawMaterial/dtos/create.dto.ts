import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';

export class RawMaterialCombinationDTO {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sourcingPrice?: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class RawMaterialCreateDTO {
  @ApiProperty({ type: String, example: 'Steel Rod' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, required: false, example: 'kg' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sourcingPrice?: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ type: [RawMaterialCombinationDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawMaterialCombinationDTO)
  combinations?: RawMaterialCombinationDTO[];
}