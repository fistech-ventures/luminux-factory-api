import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ENUM_ORDER_SOURCE, ENUM_PANEL } from '../../const';
import { OrderCreateDTO, OrderQuickCreateDTO } from '../../dtos/order/create.dto';
import { OrderFilterDTO } from '../../dtos/order/filter.dto';
import { Order } from '../../entities/order.entity';
import { OrderService } from '../../services/order.service';
import { OrderStatusService } from '../../services/orderStatus.service';

@ApiTags('Order')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/orders')
export class OrderWebController {
  constructor(
    private readonly service: OrderService,
    private readonly orderStatusService: OrderStatusService
  ) { }

  RELATIONS: FindOptionsRelations<Order> = { items: true };

  // @Get()
  // async findAll(
  //   @Query() query: OrderFilterDTO,
  //   @AuthUser() authUser: IAuthUser,
  // ): Promise<SuccessResponse<Order[]>> {
  //   query['userId'] = authUser.id
  //   return this.service.findAllBase(query, { relations: this.RELATIONS });
  // }

  @Get()
  async findAllWithStats(
    @Query() query: OrderFilterDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<Order[]>> {
    query['userId'] = authUser.id
    return this.service.findAllWithStats(query, { relations: this.RELATIONS });
  }

  @CacheKey('orders:tracking_by_id/{id}')
  @CacheTTL(10800) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('by-id/:id/tracking')
  async getTrackingByOrderId(@Param('id') id: string): Promise<any> {
    return this.orderStatusService.getTrackingByOrderId(id);
  }

  @CacheKey('orders:tracking_by_code/{orderCode}')
  @CacheTTL(10800) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get(':orderCode/tracking')
  async getTracking(@Param('orderCode') orderCode: string): Promise<any> {
    return this.orderStatusService.getTracking(orderCode);
  }

  @Get(':id')
  async findById(@Param('id') id: string,
    @AuthUser() authUser: IAuthUser,
  ): Promise<Order> {
    return this.service.findOneBase({ id, userId: authUser.id }, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: OrderCreateDTO, @AuthUser() authUser: IAuthUser): Promise<Order> {
    body['panel'] = ENUM_PANEL.WEB
    return this.service.createOrder(body, authUser);
  }

  @Public()
  @Post('quick')
  async createQuickOrder(@Body() body: OrderQuickCreateDTO): Promise<Order> {
    body['panel'] = ENUM_PANEL.WEB
    body['source'] = ENUM_ORDER_SOURCE.WEBSITE
    return this.service.createQuickOrder(body);
  }
}
