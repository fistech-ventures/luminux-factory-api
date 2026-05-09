import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { PublicationCreateDTO } from '../../dtos/create.dto';
import { PublicationFilterDTO } from '../../dtos/filter.dto';
import { PublicationUpdateDTO } from '../../dtos/update.dto';
import { Publication } from '../../entities/publication.entity';
import { PublicationService } from '../../services/publication.service';

@ApiTags('Publication')
@ApiBearerAuth()
@Controller('internal/publications')
export class PublicationInternalController {
  constructor(private readonly service: PublicationService) { }

  RELATIONS: FindOptionsRelations<Publication> = {};

  @Get()
  async findAll(
    @Query() query: PublicationFilterDTO,
  ): Promise<SuccessResponse<Publication[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Publication> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }


  @CacheRevalidateKeys(['publications'])
  @UseInterceptors(CacheInterceptor)
  @Post()
  async createOne(@Body() body: PublicationCreateDTO): Promise<Publication> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['publications'])
  @UseInterceptors(CacheInterceptor)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: PublicationUpdateDTO,
  ): Promise<Publication> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
