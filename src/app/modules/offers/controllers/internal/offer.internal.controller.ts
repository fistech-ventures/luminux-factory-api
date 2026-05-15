import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CreateOfferDto } from '../../dtos/offer/create.dto';
import { UpdateOfferDto } from '../../dtos/offer/update.dto';
import { Offer } from '../../entities/offer.entity';
import { OfferService } from '../../services/offer.service';

@ApiTags('Special Offer')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/offers')
export class OfferInternalController {
  constructor(private readonly service: OfferService) {}

  @Get()
  async findAll(): Promise<Offer[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Offer> {
    return this.service.findById(id);
  }

  @Post()
  async create(@Body() body: CreateOfferDto): Promise<Offer> {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateOfferDto): Promise<Offer> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<Offer> {
    return this.service.toggleActive(id);
  }
}
