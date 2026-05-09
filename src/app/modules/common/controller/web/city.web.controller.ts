// import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { Public } from '@src/app/decorators/publicRoute.decorator';
// import { ClientRequestInterceptor } from '@src/app/interceptors/clientRequest.interceptor';
// import { SuccessResponse } from '@src/app/types';
// import { FindOptionsRelations } from 'typeorm';
// import { FilterCityDTO } from '../../dtos';
// import { City } from '../../entities/city.entity';
// import { CityService } from '../../services/city.service';

// @ApiTags('Address#City')
// @ApiBearerAuth()
// @UseInterceptors(ClientRequestInterceptor)
// @Controller('web/cities')
// export class CityWebController {
//   constructor(private readonly service: CityService) { }
//   RELATIONS: FindOptionsRelations<City> = {};

//   @Public()
//   @Get()
//   async findAll(@Query() query: FilterCityDTO): Promise<SuccessResponse<City[]>> {
//     return this.service.findAllBase(query, { relations: this.RELATIONS });
//   }

//   @Public()
//   @Get(':id')
//   async findById(@Param('id') id: string): Promise<City> {
//     return this.service.findByIdBase(id, { relations: this.RELATIONS });
//   }
// }
