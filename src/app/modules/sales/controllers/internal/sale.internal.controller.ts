import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SaleService } from '../../services/sale.service';
import { CreateSaleDTO } from '../../dtos/create.dto';
import { UpdateSaleDTO } from '../../dtos/update.dto';
import { FilterSaleDTO } from '../../dtos/filter.dto';
import { Sale } from '../../entities/sale.entity';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Sales')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/sales')
export class SaleInternalController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  async create(@Body() payload: CreateSaleDTO): Promise<Sale> {
    return await this.saleService.createSale(payload);
  }

  @Get()
  async findAll(@Query() query: FilterSaleDTO): Promise<any> {
    return await this.saleService.findAllBase(query);
  }

  /** Returns the sale's invoice as a PDF, generated on demand from live data. */
  @Get(':id/invoice')
  async invoice(@Param('id') id: string): Promise<StreamableFile> {
    const sale = await this.saleService.findByIdBase(id);
    const pdf = await this.saleService.getInvoicePdf(id);
    const fileName = `${sale?.invoiceNo || sale?.id || 'invoice'}.pdf`;
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="${fileName}"`,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sale> {
    return await this.saleService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateSaleDTO): Promise<Sale> {
    return await this.saleService.updateSale(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.saleService.deleteOneBase(id);
  }
}
