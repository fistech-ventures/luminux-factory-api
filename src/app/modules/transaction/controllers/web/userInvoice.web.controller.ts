import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { PaymentRequestCreateDTO } from '../../dtos/userInvoice/create.dto';
import { UserInvoice } from '../../entities/userInvoice.entity';
import { UserInvoiceService } from '../../services/userInvoice.service';

@ApiTags('User Invoice')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-invoices')
export class UserInvoiceWebController {
  constructor(
    private readonly service: UserInvoiceService,
  ) { }
  RELATIONS: FindOptionsRelations<UserInvoice> = {};

  @Get()
  async findAll(
    @Query() query: any,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<UserInvoice[]>> {
    return this.service.findAllBase(
      { ...query, userId: authUser.id },
      { relations: this.RELATIONS },
    );
  }

  @Public()
  @Get('by-code/:code')
  async findInvoiceByCode(@Param('code') code: string): Promise<UserInvoice> {
    return this.service.findOneBase(
      { code },
      { relations: { order: { items: true } } },
    );
  }

  @Get(':id')
  async findInvoiceById(@Param('id') id: string): Promise<UserInvoice> {
    return this.service.findByIdBase(id, {
      relations: { order: { items: true } },
    });
  }

  @Public()
  @Post('pay')
  async payInvoice(
    @Body() data: PaymentRequestCreateDTO,
  ): Promise<any> {
    const response = await this.service.paymentRequest(data);
    return response;
  }

  @Post('payment-request')
  async paymentRequest(
    @Body() data: PaymentRequestCreateDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<any> {
    const response = await this.service.paymentRequest(data, authUser);
    return response;
  }

  @Public()
  @Post('payment-confirmation')
  async paymentConfirmation(@Body() body: any): Promise<SuccessResponse> {
    return this.service.paymentConfirmation(body);
  }
}
