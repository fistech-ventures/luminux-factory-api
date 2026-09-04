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
import { ExpenseService } from '../../services/expense.service';
import { CreateExpenseDTO } from '../../dtos/create.dto';
import { Expense } from '../../entities/expense.entity';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UpdateExpenseDTO } from '../../dtos/update.dto';
import { ExpenseFilterDTO } from '../../dtos/filter.dto';

@ApiTags('Expense')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/expense')
export class ExpenseInternalController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() payload: CreateExpenseDTO): Promise<Expense> {
    return await this.expenseService.createExpense(payload);
  }

  @Get()
  async findAll(@Query() query: ExpenseFilterDTO): Promise<any> {
    return await this.expenseService.findAllBase(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Expense> {
    return await this.expenseService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateExpenseDTO): Promise<Expense> {
    return await this.expenseService.updateExpense(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.expenseService.deleteOneBase(id);
  }
}
