import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { AuthorCreateDTO } from '../../dtos/create.dto';
import { AuthorFilterDTO } from '../../dtos/filter.dto';
import { AuthorUpdateDTO } from '../../dtos/update.dto';
import { Author } from '../../entities/author.entity';
import { AuthorService } from '../../services/author.service';

@ApiTags('Author')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/authors')
export class AuthorInternalController {
  constructor(private readonly service: AuthorService) { }

  RELATIONS: FindOptionsRelations<Author> = {};

  @Get()
  async findAll(
    @Query() query: AuthorFilterDTO,
  ): Promise<SuccessResponse<Author[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Author> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['authors'])
  @UseInterceptors(CacheInterceptor)
  @Post()
  async createOne(@Body() body: AuthorCreateDTO): Promise<Author> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['authors'])
  @UseInterceptors(CacheInterceptor)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: AuthorUpdateDTO,
  ): Promise<Author> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
