import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { AuthorFilterDTO } from '../../dtos/filter.dto';
import { Author } from '../../entities/author.entity';
import { AuthorService } from '../../services/author.service';

@ApiTags('Author')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/authors')
export class AuthorWebController {
  constructor(private readonly service: AuthorService) { }
  RELATIONS: FindOptionsRelations<Author> = {};

  @CacheKey('authors:lists')
  @CacheTTL(21600) // 21600 seconds = 12 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get()
  async findAll(
    @Query() query: AuthorFilterDTO,
  ): Promise<SuccessResponse<Author[]>> {
    query['isActive'] = true;
    return this.service.findAllBase(query,
      {
        select: {
          id: true,
          name: true,
          image: true,
          isFeaturedOnBirthday: true,
          featuredImage: true,
        },
      });
  }
}
