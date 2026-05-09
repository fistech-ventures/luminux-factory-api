import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';

import { Public } from '@src/app/decorators/publicRoute.decorator';
import { FilterFormDTO } from '../../dtos/form';
import { Form } from '../../entities/form.entity';
import { FormService } from '../../services/form.service';

@ApiTags('Form')
@ApiBearerAuth()
@Controller('web/forms')
export class WebFormController {
  constructor(private readonly service: FormService) { }
  RELATIONS = {};

  @Public()
  @Get()
  async findAll(@Query() query: FilterFormDTO): Promise<SuccessResponse | Form[]> {
    query.isActive = true;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Form> {
    return this.service.repo.findOne({ where: { id, isActive: true } });
  }

  @Public()
  @Get('by-slug/:slug')
  async findBySug(@Param('slug') slug: string): Promise<Form> {
    return this.service.repo.findOne({ where: { slug, isActive: true } });
  }

  @Public()
  @Patch('increment-visit-count/:slug')
  async updateOne(@Param('slug') slug: string): Promise<Form> {
    const form = await this.service.findOne({ where: { slug } });
    if (!form) {
      throw new Error('Form not found');
    }
    await this.service._repo.update({ slug }, { visitCount: (form.visitCount || 0) + 1 });
    return this.service._repo.findOne({ where: { slug } });
  }
}
