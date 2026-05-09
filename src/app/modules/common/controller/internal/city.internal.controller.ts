// import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { InternalRequestInterceptor } from '@src/app/interceptors';
// import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
// import { SuccessResponse } from '@src/app/types';
// import { FindOptionsRelations } from 'typeorm';
// import { CityCreateDTO, CityUpdateDTO, FilterCityDTO } from '../../dtos';
// import { City } from '../../entities/city.entity';
// import { CityService } from '../../services/city.service';

// @ApiTags('Address#City')
// @ApiBearerAuth()
// @UseInterceptors(InternalRequestInterceptor)
// @Controller('internal/cities')
// export class CityInternalController {
//   constructor(private readonly service: CityService) { }
//   RELATIONS: FindOptionsRelations<City> = {};

//   @Get()
//   async findAll(@Query() query: FilterCityDTO): Promise<SuccessResponse<City[]>> {
//     return this.service.findAllBase(query, { relations: this.RELATIONS });
//   }

//   @Get(':id')
//   async findById(@Param('id') id: string): Promise<City> {
//     return this.service.findByIdBase(id, { relations: this.RELATIONS });
//   }

//   @Post()
//   async create(@Body() body: CityCreateDTO): Promise<City> {
//     return this.service.createOneBase(body, { relations: this.RELATIONS });
//   }

//   @Patch(':id')
//   async update(
//     @Param('id', UuidValidationPipe) id: string,
//     @Body() body: CityUpdateDTO,
//   ): Promise<City> {
//     return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
//   }
// }
