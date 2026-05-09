import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { UserInvoiceFilterDTO } from '../../dtos/userInvoice/filter.dto';
import { UserInvoice } from '../../entities/userInvoice.entity';
import { UserInvoiceService } from '../../services/userInvoice.service';

@ApiTags('User Invoice')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/user-invoices')
export class UserInvoiceInternalController {
  constructor(
    private readonly service: UserInvoiceService,
  ) { }
  RELATIONS: FindOptionsRelations<UserInvoice> = {
    user: true,
  };

  @Get()
  async findAll(@Query() query: UserInvoiceFilterDTO): Promise<SuccessResponse<UserInvoice[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get('by-code/:code')
  async findInvoiceByCode(@Param('code') code: string): Promise<UserInvoice> {
    return this.service.findOneBase(
      { code },
      { relations: { order: { items: true, }, } },
    );
  }

  @Get(':id')
  async findInvoiceById(@Param('id') id: string): Promise<UserInvoice> {
    return this.service.findByIdBase(id, {
      relations: { order: { items: true, }, },
    });
  }
}
