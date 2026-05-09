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
import { ResponseInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import {
  CreatePermissionTypeDTO,
  FilterPermissionTypeDTO,
  UpdatePermissionTypeDTO,
} from '../../dtos';
import { PermissionType } from '../../entities/permissionType.entity';
import { PermissionTypeService } from '../../services/permissionType.service';

@ApiTags('RBAC#PermissionType')
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
@Controller('internal/permission-types')
export class InternalPermissionTypeController {
  constructor(private readonly service: PermissionTypeService) {}
  RELATIONS: FindOptionsRelations<PermissionType> = {};

  @Get()
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async findAll(
    @Query() query: FilterPermissionTypeDTO,
  ): Promise<SuccessResponse<PermissionType[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async findById(@Param('id') id: string): Promise<PermissionType> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async createOne(@Body() body: CreatePermissionTypeDTO): Promise<PermissionType> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdatePermissionTypeDTO,
  ): Promise<PermissionType> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Delete(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
