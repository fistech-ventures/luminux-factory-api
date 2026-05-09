import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { UserInvoice } from '@src/app/modules/transaction/entities/userInvoice.entity';
import { UserInvoiceService } from '@src/app/modules/transaction/services/userInvoice.service';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { FindOptionsRelations } from 'typeorm';
import { ENUM_INTERNAL_ORDER_STATUS, ENUM_PANEL } from '../../const';
import { OrderCreateDTO, OrderMakePaymentDTO, OrderQuickCreateDTO } from '../../dtos/order/create.dto';
import { OrderFilterDTO } from '../../dtos/order/filter.dto';
import { OrderStatusUpdateDTO, OrderUpdateDTO } from '../../dtos/order/update.dto';
import { Order } from '../../entities/order.entity';
import { OrderService } from '../../services/order.service';
import { OrderStatusService } from '../../services/orderStatus.service';

@ApiTags('Order')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/orders')
export class OrderInternalController {
  constructor(
    private readonly service: OrderService,
    private readonly userInvoiceService: UserInvoiceService,
    private readonly orderStatusService: OrderStatusService,
  ) { }

  RELATIONS: FindOptionsRelations<Order> = { items: true, userInvoice: true };

  // @Get()
  // async findAll(
  //   @Query() query: OrderFilterDTO,
  // ): Promise<SuccessResponse<Order[]>> {
  //   return this.service.findAllBase(query, { relations: this.RELATIONS });
  // }

  @Get()
  async findAllWithStats(
    @Query() query: OrderFilterDTO,
  ): Promise<SuccessResponse<Order[]>> {
    return this.service.findAllWithStats(query, { relations: this.RELATIONS });
  }

  @Get(':id/invoice')
  async findInvoiceById(@Param('id') id: string): Promise<UserInvoice> {
    return this.userInvoiceService.findOneBase({ orderId: id }, { relations: { order: { items: true } } });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Order> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: OrderCreateDTO, @AuthUser() authUser: IAuthUser): Promise<Order> {
    body['panel'] = ENUM_PANEL.PANEL
    return this.service.createOrder(body, authUser);
  }

  @Post('quick')
  async createQuickOrder(@Body() body: OrderQuickCreateDTO): Promise<Order> {
    body['panel'] = ENUM_PANEL.PANEL
    return this.service.createQuickOrder(body);
  }

  @Post(':id/re-generate-invoice-pdf')
  async generateInvoiceByOrderId(
    @Param('id') id: string,
    @AuthUser() authUser: IAuthUser,
  ): Promise<Order> {
    const isOrderExist = await this.service.isExist({ id }, { relations: { items: true } })
    return this.service.generateInvoiceByOrder(isOrderExist, authUser);
  }

  @Post(':id/make-payment')
  async makePayment(
    @Param('id') id: string,
    @Body() body: OrderMakePaymentDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<Order> {
    return this.service.makePayment(id, body, authUser);
  }

  @CacheRevalidateKeys(['orders:tracking_{id}s'])
  @UseInterceptors(CacheInterceptor)
  @Post(':id/status')
  async addStatus(
    @Param('id') id: string,
    @Body() body: OrderStatusUpdateDTO,
    @AuthUser() authUser: IAuthUser
  ): Promise<any> {
    if (ENV.isDevelopment && body?.operationalStatus === ENUM_INTERNAL_ORDER_STATUS.READY_TO_SHIP && !body?.serviceProviderId)
      throw new BadRequestException('Logistic Service Provider must be selected when setting status to READY_TO_SHIP');
    return this.orderStatusService.addStatus(id, body.operationalStatus, authUser, body.note, body?.serviceProviderId, { force: body.force });
  }

  @Get(':id/tracking')
  async getTracking(@Param('id') id: string): Promise<any> {
    return this.orderStatusService.getTracking(id);
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: OrderUpdateDTO,
  ): Promise<Order> {
    return this.service.updateOrder(id, body, { relations: this.RELATIONS });
  }
}
