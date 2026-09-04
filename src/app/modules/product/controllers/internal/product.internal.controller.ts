import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { ProductCreateDTO } from '../../dtos/product/create.dto';
import { ProductFilterDTO } from '../../dtos/product/filter.dto';
import { ProductUpdateDTO } from '../../dtos/product/update.dto';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../services/product.service';

@ApiTags('Product')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/products')
export class ProductInternalController {
  constructor(private readonly service: ProductService) { }

  @Get()
  async findAll(@Query() query: ProductFilterDTO): Promise<SuccessResponse<Product[]>> {
    return this.service.findAllBase(query, { relations: this.service.RELATIONS });
  }

  @Get('by-code/:productCode')
  async findByCode(@Param('productCode') productCode: string): Promise<Product> {
    return this.service.findOneBase({ productCode } as any, { relations: this.service.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id', UuidValidationPipe) id: string): Promise<Product> {
    return this.service.findByIdBase(id, { relations: this.service.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductCreateDTO): Promise<Product> {
    return this.service.createProduct(body);
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductUpdateDTO,
  ): Promise<Product> {
    return this.service.updateProduct(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', UuidValidationPipe) id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
