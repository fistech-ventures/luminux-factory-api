import { NotFoundException } from '@nestjs/common';
import { BaseEntity, IBaseService, IMultipleSort } from '@src/app/base';
import { findAllByRepo, pruneSoftDeleted } from '@src/shared/utils/dborm.utils';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SaveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import isUuidValidator from 'validator/lib/isUUID';
import { IFindBaseOptions } from '../interfaces';
import { SuccessResponse } from '../types';

export abstract class BaseService<T extends BaseEntity> implements IBaseService<T> {
  constructor(public repo: Repository<T>) {}

  public async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  public async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repo.count(options);
  }

  public async findOne(options?: FindOneOptions<T>): Promise<T> {
    return this.repo.findOne(options);
  }

  // NOTE: Hard delete is intentionally NOT provided as a public method.
  // All deletions must go through softDelete() which sets isDeleted = true.
  // The repo.delete() method is deliberately not exposed as a public API.

  public async save(
    entities: T[],
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<T[]> {
    return this.repo.save(entities, options);
  }

  public async saveOne(
    entity: T,
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<T> {
    return this.repo.save(entity, options);
  }

  public async isExist(filters: T, options?: IFindBaseOptions<T>): Promise<T> {
    const isExist = await this.repo.findOne({
      where: filters as FindOptionsWhere<T>,
      relations: options?.relations ? options?.relations : {},
      // select: options?.select ? { ...options.select, createdAt: true } : {}
    });
    let msg = '';
    if (filters?.id) {
      msg = `ID ${filters.id}`;
    }
    if (!isExist) {
      throw new NotFoundException(`${this.repo.metadata.name} With ${msg} Not Found`);
    }
    return isExist;
  }

  async findAllBase(
    filters: T & {
      searchTerm?: string;
      initialLoadIds?: string[];
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      sort?: IMultipleSort[];
    },
    options?: IFindBaseOptions<T>,
  ): Promise<SuccessResponse<T[]>> {
    return findAllByRepo(this.repo, filters, options);
  }

  async findByIdBase(id: string, options?: IFindBaseOptions<T>): Promise<T> {
    const opts: FindOneOptions = {
      // Deletion is always a soft delete (hard deletes are blocked by database
      // triggers), so a soft-deleted row must never be returned by id.
      where: { id, isDeleted: false },
    };
    if (options?.select) opts.select = { createdAt: true, ...options?.select };
    if (options?.relations) opts.relations = options?.relations;

    return pruneSoftDeleted(await this.repo.findOne(opts));
  }

  async findOneBase(filters: T, options?: IFindBaseOptions<T>): Promise<T> {
    const relations = this.repo.metadata.relations.map((r) => r.propertyName);

    Object.keys(filters).forEach((key) => {
      if (relations.includes(key) && isUuidValidator(filters[key])) {
        filters[key] = {
          id: filters[key],
        };
      }
    });
    const opts: FindOneOptions = {
      where: {
        ...filters,
      },
    };
    if (options?.select) opts.select = { createdAt: true, ...options?.select };
    if (options?.relations) opts.relations = options?.relations;
    return await this.repo.findOne(opts);
  }

  async createOneBase(data: T, options?: IFindBaseOptions<T>): Promise<T> {
    const created = await this.repo.save(data);
    return await this.findByIdBase(created.id, options);
  }

  async updateOneBase(
    id: string,
    data: QueryDeepPartialEntity<T>,
    options?: IFindBaseOptions<T>,
  ): Promise<T> {
    await this.repo.update(id, data);
    return await this.findByIdBase(id, options);
  }

  async deleteOneBase(id: string): Promise<SuccessResponse> {
    await this.repo.update(id, { isDeleted: true } as any);
    return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
  }

  async deleteBulkBase(id: string[]): Promise<SuccessResponse> {
    if (id.length === 0) {
      return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
    }
    await this.repo.update(id, { isDeleted: true } as any);
    return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
  }

  async softDeleteOneBase(id: string): Promise<SuccessResponse> {
    await this.repo.softDelete(id);
    return new SuccessResponse(`${this.repo.metadata.name} deleted successfully`, null);
  }

  async recoverByIdBase(id: string, options?: IFindBaseOptions<T>): Promise<T> {
    // `recover` only clears deletedAt (the DeleteDateColumn). The isDeleted flag
    // is what read queries filter on, so it has to be cleared as well.
    await this.repo.update(id, { isDeleted: false } as any);
    await this.repo.recover({ id } as DeepPartial<T>);
    return await this.findByIdBase(id, options);
  }
}
