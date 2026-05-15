import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CreateCouponDto } from '../../dtos/create-coupon.dto';
import { UpdateCouponDto } from '../../dtos/update-coupon.dto';
import { Coupon } from '../../entities/coupon.entity';
import { CouponService } from '../../services/coupon.service';

@ApiTags('Coupon')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/coupons')
export class CouponInternalController {
  constructor(private readonly service: CouponService) {}

  @Get()
  async findAll(): Promise<Coupon[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Coupon> {
    return this.service.findById(id);
  }

  @Post()
  async create(@Body() body: CreateCouponDto): Promise<Coupon> {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCouponDto): Promise<Coupon> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<Coupon> {
    return this.service.toggleActive(id);
  }
}
