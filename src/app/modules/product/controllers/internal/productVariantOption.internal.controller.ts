import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ProductVariantOptionCreateDTO } from '../../dtos/productVariantOption/create.dto';
import { ProductVariantOptionFilterDTO } from '../../dtos/productVariantOption/filter.dto';
import { ProductVariantOptionUpdateDTO } from '../../dtos/productVariantOption/update.dto';
import { ProductVariantOption } from '../../entities/productVariantOption.entity';
import { ProductVariantOptionService } from '../../services/productVariantOption.service';

@ApiTags('Product Variant')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/product-variant-options')
export class ProductVariantOptionInternalController {
  constructor(private readonly service: ProductVariantOptionService) { }
  RELATIONS: FindOptionsRelations<ProductVariantOption> = { variant: true, variantOption: true };

  @Get()
  async findAll(@Query() query: ProductVariantOptionFilterDTO): Promise<SuccessResponse<ProductVariantOption[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductVariantOption> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductVariantOptionCreateDTO): Promise<ProductVariantOption> {
    return this.service.createOneBase(body);
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductVariantOptionUpdateDTO,
  ): Promise<ProductVariantOption> {
    return this.service.updateOneBase(id, body);
  }
}