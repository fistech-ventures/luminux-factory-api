import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ContactCreateDTO } from '../../dtos/create.dto';
import { ContactFilterDTO } from '../../dtos/filter.dto';
import { ContactUpdateDTO } from '../../dtos/update.dto';
import { Contact } from '../../entities/contact.entity';
import { ContactService } from '../../services/contact.service';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/contacts')
export class ContactInternalController {
  constructor(private readonly service: ContactService) { }

  RELATIONS: FindOptionsRelations<Contact> = {};

  @Get()
  async findAll(@Query() query: ContactFilterDTO): Promise<SuccessResponse<Contact[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Contact> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: ContactCreateDTO): Promise<Contact> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: ContactUpdateDTO): Promise<Contact> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
