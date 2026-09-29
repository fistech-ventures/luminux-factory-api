import { BadRequestException } from '@nestjs/common';
import { BaseEntity, IMultipleSort } from '@src/app/base';
import { IFindBaseOptions } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import {
  Between,
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  QueryRunner,
  Raw,
  Repository,
} from 'typeorm';
import { toNumber } from './convert.utils';

export const startTransaction = async (dataSource: DataSource): Promise<QueryRunner> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
};

export const commitTransaction = async (
  queryRunner: QueryRunner,
  _timeout?: number,
): Promise<void> => {
  const timeout = _timeout ? _timeout : 1000 * 60;

  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Transaction timeout'));
    }, timeout);
  });
  try {
    await Promise.race([
      (async () => {
        await queryRunner.commitTransaction();
      })(),
      timeoutPromise,
    ]);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const rollbackTransaction = async (queryRunner: QueryRunner): Promise<void> => {
  try {
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};

export const lockEntireTable = async (
  queryRunner: QueryRunner,
  tableName: string,
  lockMode:
    | 'ACCESS SHARE'
    | 'ROW SHARE'
    | 'ROW EXCLUSIVE'
    | 'SHARE UPDATE EXCLUSIVE'
    | 'SHARE'
    | 'SHARE ROW EXCLUSIVE'
    | 'EXCLUSIVE'
    | 'ACCESS SHARE'
    | 'ACCESS EXCLUSIVE',
): Promise<QueryRunner> => {
  await queryRunner.query(`LOCK TABLE "${tableName}" IN ${lockMode} MODE`);
  return queryRunner;
};

const getNestedSearchValue = (value: unknown, path: string): unknown[] => {
  if (Array.isArray(value)) return value.flatMap((item) => getNestedSearchValue(item, path));
  if (value == null) return [];
  if (!path) return [value];

  const [segment, ...remaining] = path.split('.');
  return getNestedSearchValue((value as Record<string, unknown>)[segment], remaining.join('.'));
};

const getSearchScore = (item: unknown, searchTerms: string[], searchTerm: string): number => {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase();
  return searchTerms.reduce<number>((bestScore, term, index) => {
    const path = term.includes(':') ? term.split(':')[0] : term;
    const property = term.includes(':') ? term.split(':')[1] : path;
    const values = getNestedSearchValue(item, property || path);
    return values.reduce<number>((score, value) => {
      const normalizedValue = String(value ?? '').toLocaleLowerCase();
      if (!normalizedValue.includes(normalizedTerm)) return score;
      const matchScore =
        (normalizedValue === normalizedTerm ? 100000 : 0) +
        (normalizedValue.startsWith(normalizedTerm) ? 10000 : 0) +
        1000 -
        normalizedValue.length -
        index;
      return Math.max(score, matchScore);
    }, bestScore);
  }, 0);
};

/**
 * Removes soft-deleted rows (`isDeleted === true`) from a result graph.
 *
 * Deletion in this application is always a soft delete — hard deletes are
 * blocked by database triggers — so a row with `isDeleted = true` must never be
 * part of an API response, neither as the returned row itself nor nested inside
 * a relation (e.g. a product's variants). TypeORM cannot filter loaded relations
 * with a `where`, hence this post-processing step.
 */
export const pruneSoftDeleted = <T>(value: T): T => {
  if (
    value &&
    typeof value === 'object' &&
    (value as { isDeleted?: boolean }).isDeleted === true
  ) {
    return null as T;
  }

  if (Array.isArray(value)) {
    return value
      .filter(
        (item) =>
          !(
            item &&
            typeof item === 'object' &&
            (item as { isDeleted?: boolean }).isDeleted === true
          ),
      )
      .map((item) => pruneSoftDeleted(item)) as unknown as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      record[key] = pruneSoftDeleted(record[key]);
    }
  }

  return value;
};

const sortPositionedArrays = <T>(value: T): T => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    value.forEach(sortPositionedArrays);
    if (
      value.every((item) => item && typeof item === 'object' && typeof item.position === 'number')
    ) {
      value.sort((left, right) => left.position - right.position);
    }
    return value as T;
  }
  Object.values(value).forEach(sortPositionedArrays);
  return value;
};

export async function findAllByRepo<T extends BaseEntity>(
  repo: Repository<T>,
  filters: T & {
    searchTerm?: string;
    initialLoadIds?: string[];
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    sort?: IMultipleSort[];
    startDate?: string;
    endDate?: string;
  },
  options?: IFindBaseOptions<T>,
): Promise<SuccessResponse<T[]>> {
  const {
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    sort,
    searchTerm,
    initialLoadIds,
    limit: take = 20,
    page = 1,
    startDate,
    endDate,
    ...queryOptions
  } = filters;
  const skip = (page - 1) * take;

  // Deleted rows are archival only: lists, pagination totals, and relations
  // must never include them. Recovery uses explicit include-deleted lookups.
  const softDeleteWhere: { isDeleted: boolean } = { isDeleted: false };
  Object.assign(queryOptions as Record<string, unknown>, softDeleteWhere);

  // Date-range filtering. startDate/endDate come from BaseFilterDTO and are not
  // entity columns, so strip them from the where clause and apply a real range
  // on the entity's business date column (DATE_FILTER_COLUMN) when one is
  // declared, otherwise fall back to createdAt.
  if (startDate || endDate) {
    let dateColumn = options?.DATE_FILTER_COLUMN;

    if (!dateColumn) {
      try {
        const targetValue = repo.target?.valueOf();
        if (targetValue && typeof targetValue === 'object' && 'DATE_FILTER_COLUMN' in targetValue) {
          dateColumn = (targetValue as any).DATE_FILTER_COLUMN;
        }
      } catch (_e) {
        dateColumn = undefined;
      }
    }

    const column = dateColumn || 'createdAt';
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (start && Number.isNaN(start.getTime())) {
      throw new BadRequestException(`Invalid startDate: ${startDate}`);
    }
    if (end && Number.isNaN(end.getTime())) {
      throw new BadRequestException(`Invalid endDate: ${endDate}`);
    }

    // For date-only values (YYYY-MM-DD) include the whole end day.
    if (end && typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      (queryOptions as any)[column] = Between(start, end);
    } else if (start) {
      (queryOptions as any)[column] = MoreThanOrEqual(start);
    } else if (end) {
      (queryOptions as any)[column] = LessThanOrEqual(end);
    }
  }

  // Handle initial load IDs
  let initialData: T[] = [];
  if (initialLoadIds && initialLoadIds.length) {
    initialData = await repo.find({
      where: {
        id: In(initialLoadIds) as any,
        ...softDeleteWhere,
      } as FindOptionsWhere<T>,
      relations: options?.relations,
      select: options?.select,
    });

    // Exclude initialLoadIds from queryOptions
    queryOptions['id'] = Not(In(initialData.map((item) => item.id))) as any;
  }
  const relations = repo.metadata.relations.map((r) => r.propertyName);
  //! TODO CHECK USE CASE
  // Object.keys(queryOptions).forEach((key) => {
  //   if (relations.includes(key) && isUuidValidator(queryOptions[key])) {
  //     queryOptions[key] = {
  //       id: queryOptions[key],
  //     };
  //   }
  // });

  const opts: FindManyOptions = {
    where: queryOptions as FindOptionsWhere<T>,
  };

  let searchTermsForScore: string[] = [];
  const hasSearchTerm = Boolean(searchTerm?.trim());
  if (hasSearchTerm) {
    try {
      let SEARCH_TERMS = options?.SEARCH_TERMS;

      if (!SEARCH_TERMS) {
        // Try to get SEARCH_TERMS from the entity
        try {
          const targetValue = repo.target?.valueOf();
          if (
            targetValue &&
            (typeof targetValue === 'object' || typeof targetValue === 'function') &&
            'SEARCH_TERMS' in targetValue
          ) {
            SEARCH_TERMS = (targetValue as { SEARCH_TERMS?: string[] }).SEARCH_TERMS;
          }
        } catch (_e) {
          // If accessing SEARCH_TERMS fails, just use empty array
          SEARCH_TERMS = [];
        }
      }

      if (!SEARCH_TERMS) {
        SEARCH_TERMS = [];
      }
      searchTermsForScore = SEARCH_TERMS;

      if (SEARCH_TERMS.length > 0) {
        if (Object.keys(queryOptions).length) {
          SEARCH_TERMS = SEARCH_TERMS.filter(
            (term: string) => !Object.keys(queryOptions).includes(term),
          );
        }

        const where = [];
        for (const term of SEARCH_TERMS) {
          // Check if the search term is a relation
          if (term?.includes('.')) {
            const [relation, ...fieldPath] = term.split('.');
            // Check if the relation is allowed
            if (!relations.includes(relation)) {
              continue;
            }
            let nestedField: unknown = ILike(`%${searchTerm}%`);
            for (let index = fieldPath.length - 1; index >= 0; index -= 1) {
              nestedField = { [fieldPath[index]]: nestedField };
            }
            where.push({
              ...queryOptions,
              [relation]: {
                ...(nestedField as Record<string, unknown>),
              },
            });
          } else if (term?.includes(':')) {
            const [field, property] = term.split(':');
            // search on jsonb property
            where.push({
              ...queryOptions,
              [field]: Raw((alias) => `${alias} ->> '${property}' ILIKE '%${searchTerm}%'`),
            });
          } else {
            where.push({
              ...queryOptions,
              [term]: ILike(`%${searchTerm}%`),
            });
          }
        }

        if (where.length > 0) {
          opts.where = where as any;
        }
      }
    } catch (error) {
      // If SEARCH_TERMS access fails, continue without search filtering
      console.warn('Failed to access SEARCH_TERMS:', error);
    }
  }

  if (!hasSearchTerm && skip && !isNaN(skip)) opts.skip = skip;
  if (!hasSearchTerm && take && !isNaN(take)) opts.take = take;

  if (options?.relations) opts.relations = options?.relations;

  // createdAt are always selected for default createdAt desc order
  if (options?.select) opts.select = { ...options?.select, createdAt: true };

  if (sortBy && sortOrder) {
    opts.order = {
      [sortBy]: sortOrder,
    };
  }

  if (sort) {
    const sortOrderBy = sort?.reduce((result, { by, order }) => {
      result[by] = order;
      return result;
    }, {});

    opts.order = sortOrderBy;
  }

  const [allData, total] = await repo.findAndCount(opts);
  const data = hasSearchTerm
    ? allData
        .map((item) => ({
          item,
          score: getSearchScore(item, searchTermsForScore, searchTerm ?? ''),
        }))
        .sort((left, right) => right.score - left.score)
        .slice(skip, skip + take)
        .map(({ item }) => item)
    : allData;
  const sortedData = [...initialData, ...data].map(sortPositionedArrays);
  const combinedData = pruneSoftDeleted(sortedData);

  return new SuccessResponse<T[]>(`${repo.metadata.name} fetched successfully`, combinedData, {
    total: total,
    page: toNumber(page),
    limit: toNumber(take),
    skip,
  });
}
