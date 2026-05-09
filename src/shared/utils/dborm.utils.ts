import { BaseEntity, IMultipleSort } from '@src/app/base';
import { IFindBaseOptions } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
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

export async function findAllByRepo<T extends BaseEntity>(
  repo: Repository<T>,
  filters: T & {
    searchTerm?: string;
    initialLoadIds?: string[],
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    sort?: IMultipleSort[];
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
    ...queryOptions
  } = filters;
  const skip = (page - 1) * take;

  // Handle initial load IDs
  let initialData: T[] = [];
  if (initialLoadIds && initialLoadIds.length) {
    initialData = await repo.find({
      where: {
        id: In(initialLoadIds) as any,
      },
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

  if (searchTerm && repo.target.valueOf().hasOwnProperty('SEARCH_TERMS')) {
    let SEARCH_TERMS = options.SEARCH_TERMS || (repo.target.valueOf() as any).SEARCH_TERMS || [];

    if (Object.keys(queryOptions).length) {
      SEARCH_TERMS = SEARCH_TERMS.filter(
        (term: string) => !Object.keys(queryOptions).includes(term),
      );
    }

    const where = [];
    for (const term of SEARCH_TERMS) {
      // Check if the search term is a relation
      if (term?.includes('.')) {
        const [relation, field] = term.split('.');
        // Check if the relation is allowed
        if (!relations.includes(relation)) {
          continue;
        }
        where.push({
          ...queryOptions,
          [relation]: {
            [field]: ILike(`%${searchTerm}%`),
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
    // for (const term of SEARCH_TERMS) {
    //   // relation.field
    //   if (term?.includes('.')) {
    //     const [relation, field] = term.split('.');
    //     if (!relations.includes(relation)) continue;

    //     where.push({
    //       ...queryOptions,
    //       [relation]: {
    //         [field]: Raw(
    //           (alias) => `${alias}::text ILIKE :search`,
    //           { search: `%${searchTerm}%` }
    //         ),
    //       },
    //     });

    //     // jsonb field:property
    //   } else if (term?.includes(':')) {
    //     const [field, property] = term.split(':');

    //     where.push({
    //       ...queryOptions,
    //       [field]: Raw(
    //         (alias) => `
    //       (
    //         -- object / string
    //         (${alias} ->> '${property}')::text ILIKE :search

    //         OR

    //         -- array of strings
    //         EXISTS (
    //           SELECT 1
    //           FROM jsonb_array_elements_text(
    //             CASE 
    //               WHEN jsonb_typeof(${alias} -> '${property}') = 'array'
    //               THEN ${alias} -> '${property}'
    //               ELSE '[]'::jsonb
    //             END
    //           ) AS elem
    //           WHERE elem::text ILIKE :search
    //         )
    //       )
    //     `,
    //         { search: `%${searchTerm}%` }
    //       ),
    //     });

    //     // normal column OR direct jsonb array column
    //   } else {
    //     where.push({
    //       ...queryOptions,
    //       [term]: Raw(
    //         (alias) => `
    //       (
    //         -- treat everything as text
    //         ${alias}::text ILIKE :search

    //         OR

    //         -- if it's a jsonb array
    //         EXISTS (
    //           SELECT 1
    //           FROM jsonb_array_elements_text(
    //             CASE 
    //               WHEN jsonb_typeof(${alias}) = 'array'
    //               THEN ${alias}
    //               ELSE '[]'::jsonb
    //             END
    //           ) AS elem
    //           WHERE elem::text ILIKE :search
    //         )
    //       )
    //     `,
    //         { search: `%${searchTerm}%` }
    //       ),
    //     });
    //   }
    // }
    opts.where = where as FindManyOptions<T>['where'];
  }

  if (skip && !isNaN(skip)) opts.skip = skip;
  if (take && !isNaN(take)) opts.take = take;

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

  const [data, total] = await repo.findAndCount(opts);
  const combinedData = [...initialData, ...data];

  return new SuccessResponse<T[]>(`${repo.metadata.name} fetched successfully`, combinedData, {
    total: total,
    page: toNumber(page),
    limit: toNumber(take),
    skip,
  });
}
