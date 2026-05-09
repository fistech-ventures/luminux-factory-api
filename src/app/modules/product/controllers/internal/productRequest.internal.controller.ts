import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ProductRequestCreateDTO } from '../../dtos/productRequest/create.dto';
import { ProductRequestFilterDTO } from '../../dtos/productRequest/filter.dto';
import { ProductRequestStatusUpdateDTO } from '../../dtos/productRequest/update.dto';
import { ProductRequest } from '../../entities/productRequest.entity';
import { ProductRequestService } from '../../services/productRequest.service';

@ApiTags('Product Request')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/product-requests')
export class ProductRequestInternalController {
  constructor(
    private readonly service: ProductRequestService,
  ) { }
  RELATIONS: FindOptionsRelations<ProductRequest> = { product: true, user: true };

  @Get()
  async findAll(@Query() query: ProductRequestFilterDTO): Promise<SuccessResponse<ProductRequest[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductRequest> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductRequestCreateDTO): Promise<ProductRequest> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id/status')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductRequestStatusUpdateDTO,
  ): Promise<ProductRequest> {
    return this.service.updateOneBase(id, body);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
