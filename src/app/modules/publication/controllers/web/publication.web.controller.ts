import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { PublicationFilterDTO } from '../../dtos/filter.dto';
import { Publication } from '../../entities/publication.entity';
import { PublicationService } from '../../services/publication.service';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';

@ApiTags('Publication')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/publications')
export class PublicationWebController {
  constructor(private readonly service: PublicationService) { }

  RELATIONS: FindOptionsRelations<Publication> = {};

  @CacheKey('publications:lists')
  @CacheTTL(21600) // 21600 seconds = 12 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get()
  async findAll(
    @Query() query: PublicationFilterDTO,
  ): Promise<SuccessResponse<Publication[]>> {
    query['isActive'] = true;
    return this.service.findAllBase(query, {
      relations: this.RELATIONS, select: {
        id: true,
        name: true,
        logo: true,
        established: true,
      }
    });
  }
}
