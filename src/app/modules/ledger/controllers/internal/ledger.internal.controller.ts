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
import { LedgerService } from '../../services/ledger.service';
import { CreateLedgerDTO, UpdateLedgerDTO, FilterLedgerDTO } from '../../dtos/ledger.dto';
import { Ledger } from '../../entities/ledger.entity';
import { SuccessResponse } from '@src/app/types';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Ledger Internal')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/ledger')
export class LedgerInternalController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post()
  async create(@Body() payload: CreateLedgerDTO): Promise<Ledger> {
    return await this.ledgerService.createLedgerEntry(payload);
  }

  @Get()
  async findAll(@Query() query: any): Promise<any> {
    return await this.ledgerService.findAllBase(query);
  }

  @Get('filter')
  async findAllWithFilters(@Query() filters: FilterLedgerDTO): Promise<SuccessResponse<Ledger[]>> {
    return await this.ledgerService.findAllWithFilters(filters);
  }

  @Get('customer/:customerId/balance')
  async getCustomerBalance(
    @Param('customerId') customerId: string,
  ): Promise<{ totalDue: number; totalPaid: number; balance: number }> {
    return await this.ledgerService.getCustomerBalance(customerId);
  }

  @Get('supplier/:supplierId/balance')
  async getSupplierBalance(
    @Param('supplierId') supplierId: string,
  ): Promise<{ totalDue: number; totalPaid: number; balance: number }> {
    return await this.ledgerService.getSupplierBalance(supplierId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ledger> {
    return await this.ledgerService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateLedgerDTO): Promise<Ledger> {
    return await this.ledgerService.updateLedger(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.ledgerService.deleteOneBase(id);
  }
}
