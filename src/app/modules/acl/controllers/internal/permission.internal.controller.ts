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
import { CreatePermissionDTO, FilterPermissionDTO, PermissionUpsertBulkDTO, UpdatePermissionDTO } from '../../dtos';
import { Permission } from '../../entities/permission.entity';
import { PermissionService } from '../../services/permission.service';

@ApiTags('RBAC#Permission')
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
@Controller('internal/permissions')
export class InternalPermissionController {
  constructor(private readonly service: PermissionService) { }
  // RELATIONS = ['permissionType'];
  RELATIONS: FindOptionsRelations<Permission> = { permissionType: true };

  @Get()
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async findAll(@Query() query: FilterPermissionDTO): Promise<SuccessResponse<Permission[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async findById(@Param('id') id: string): Promise<Permission> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async createOne(@Body() body: CreatePermissionDTO): Promise<Permission> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Post('bulk-sync')
  async upsertBulkPermissions(@Body() body: PermissionUpsertBulkDTO): Promise<SuccessResponse<Permission[]>> {
    return this.service.upsertBulkPermissions(body);
  }

  @Patch(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async updateOne(@Param('id') id: string, @Body() body: UpdatePermissionDTO): Promise<Permission> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Delete(':id')
  // @UseGuards(AuthGuard(JWT_STRATEGY))
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
