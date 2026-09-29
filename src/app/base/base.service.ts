import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    const rows = await this.repo.find({
      ...options,
      where: this.activeWhere(options?.where),
      withDeleted: false,
    });
    return pruneSoftDeleted(rows);
  }

  public async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repo.count({
      ...options,
      where: this.activeWhere(options?.where),
      withDeleted: false,
    });
  }

  public async findOne(options?: FindOneOptions<T>): Promise<T> {
    const row = await this.repo.findOne({
      ...options,
      where: this.activeWhere(options?.where),
      withDeleted: false,
    });
    return pruneSoftDeleted(row);
  }

  // Use only for restore-on-recreate and explicit recovery workflows.
  public async findIncludingDeleted(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find({ ...options, withDeleted: true });
  }

  // Use only for restore-on-recreate and explicit recovery workflows.
  public async findOneIncludingDeleted(options?: FindOneOptions<T>): Promise<T> {
    return this.repo.findOne({ ...options, withDeleted: true });
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
    const isExist = await this.findOne({
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

  // Includes soft-deleted rows for uniqueness checks and revival.
  // Includes soft-deleted rows for uniqueness checks and revival.
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
    return await this.findOne(opts);
  }

  async createOneBase(data: T, options?: IFindBaseOptions<T>): Promise<T> {
    const restored = await this.restoreDeletedUniqueMatch(data, options);
    if (restored) return restored;

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
    await this.repo.update(id, { isDeleted: true, deletedAt: new Date() } as any);
    return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
  }

  async deleteBulkBase(id: string[]): Promise<SuccessResponse> {
    if (id.length === 0) {
      return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
    }
    await this.repo.update(id, { isDeleted: true, deletedAt: new Date() } as any);
    return new SuccessResponse(`${this.repo.metadata.name} soft-deleted successfully`, null);
  }

  async softDeleteOneBase(id: string): Promise<SuccessResponse> {
    await this.repo.update(id, { isDeleted: true, deletedAt: new Date() } as any);
    return new SuccessResponse(`${this.repo.metadata.name} deleted successfully`, null);
  }

  async recoverByIdBase(id: string, options?: IFindBaseOptions<T>): Promise<T> {
    // `recover` only clears deletedAt (the DeleteDateColumn). The isDeleted flag
    // is what read queries filter on, so it has to be cleared as well.
    await this.repo.update(id, { isDeleted: false, deletedAt: null } as any);
    await this.repo.recover({ id } as DeepPartial<T>);
    return await this.findByIdBase(id, options);
  }

  private activeWhere(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    if (!where) return { isDeleted: false } as FindOptionsWhere<T>;
    if (Array.isArray(where)) {
      return where.map((condition) => ({ ...condition, isDeleted: false }) as FindOptionsWhere<T>);
    }
    return { ...where, isDeleted: false } as FindOptionsWhere<T>;
  }

  private async restoreDeletedUniqueMatch(data: T, options?: IFindBaseOptions<T>): Promise<T | null> {
    const uniqueConstraints = [
      ...this.repo.metadata.uniques.map((unique) => unique.columns),
      ...this.repo.metadata.indices
        .filter((index) => index.isUnique)
        .map((index) => index.columns),
    ];
    const where = uniqueConstraints.flatMap((columns) => {
      const clause: Record<string, unknown> = {};
      for (const column of columns) {
        const property = column.propertyName;
        if (!(property in data) || data[property] == null) return [];
        clause[property] = data[property];
      }
      return [clause as FindOptionsWhere<T>];
    });

    if (!where.length) return null;

    const matches = await this.repo.find({ where, withDeleted: true });
    if (!matches.length) return null;

    const uniqueMatches = [...new Map(matches.map((match) => [match.id, match])).values()];
    if (uniqueMatches.length !== 1) {
      throw new BadRequestException('Unique values match multiple existing records');
    }

    const existing = uniqueMatches[0];
    if (!existing.isDeleted && !existing.deletedAt) {
      throw new BadRequestException(`${this.repo.metadata.name} already exists`);
    }

    await this.repo.save({
      ...existing,
      ...data,
      isDeleted: false,
      deletedAt: null,
    } as T);
    return this.findByIdBase(existing.id, options);
  }
}
