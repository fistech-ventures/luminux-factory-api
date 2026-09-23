import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CreateInvestmentDTO } from '../../dtos/create.dto';
import { InvestmentFilterDTO } from '../../dtos/filter.dto';
import { UpdateInvestmentDTO } from '../../dtos/update.dto';
import { Investment } from '../../entities/investment.entity';
import { InvestmentService } from '../../services/investment.service';

@ApiTags('Investment')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/investment')
export class InvestmentInternalController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(@Body() payload: CreateInvestmentDTO): Promise<Investment> {
    return this.investmentService.createInvestment(payload);
  }

  @Get()
  async findAll(@Query() query: InvestmentFilterDTO): Promise<any> {
    return this.investmentService.findAllBase(query, { relations: this.investmentService.RELATIONS });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Investment> {
    return this.investmentService.findInvestmentById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateInvestmentDTO): Promise<Investment> {
    return this.investmentService.updateInvestment(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.investmentService.deleteOneBase(id);
  }
}
