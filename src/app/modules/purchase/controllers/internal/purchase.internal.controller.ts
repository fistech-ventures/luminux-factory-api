import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PurchaseService } from '../../services/purchase.service';
import { CreatePurchaseDTO } from '../../dtos/create.dto';
import { UpdatePurchaseDTO } from '../../dtos/update.dto';
import { FilterPurchaseDTO } from '../../dtos/filter.dto';
import { Purchase } from '../../entities/purchase.entity';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Purchase')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/purchase')
export class PurchaseInternalController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() payload: CreatePurchaseDTO): Promise<Purchase> {
    return await this.purchaseService.createPurchase(payload);
  }

  @Get()
  async findAll(@Query() query: FilterPurchaseDTO): Promise<any> {
    return await this.purchaseService.findAllBase(query, {relations: this.purchaseService.RELATIONS});
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Purchase> {
    return await this.purchaseService.findByIdBase(id, {relations: this.purchaseService.RELATIONS});
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdatePurchaseDTO): Promise<Purchase> {
    return await this.purchaseService.updatePurchase(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.purchaseService.deleteOneBase(id);
  }
}
