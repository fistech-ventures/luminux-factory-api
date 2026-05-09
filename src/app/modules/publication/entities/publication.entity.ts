import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.PUBLICATIONS, { orderBy: { createdAt: 'DESC' } })
export class Publication extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  logo?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: true })
  established?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  instructions?: any;
}
