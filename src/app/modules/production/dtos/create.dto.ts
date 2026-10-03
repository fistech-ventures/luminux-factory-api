import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductionRawMaterialDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsUUID()
  rawMaterialId!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsUUID()
  rawMaterialCombinationId?: string;

  @ApiProperty({ type: Number, example: 2.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  quantity!: number;
}

export class NewProductionProductDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  productCode!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}

export class CreateProductionDTO {
  @ApiProperty({ type: String, required: false, description: 'Existing finished product id' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ type: NewProductionProductDTO, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewProductionProductDTO)
  newProduct?: NewProductionProductDTO;

  @ApiProperty({ type: Number, example: 20 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCost?: number;

  @ApiProperty({ enum: ['pending', 'approved'], required: false })
  @IsOptional()
  @IsIn(['pending', 'approved'])
  status?: 'pending' | 'approved';

  @ApiProperty({ type: [ProductionRawMaterialDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionRawMaterialDTO)
  usedRawMaterials!: ProductionRawMaterialDTO[];
}