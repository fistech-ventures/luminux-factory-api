import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.QUOTES, { orderBy: { createdAt: 'DESC' } })
export class Quote extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['author'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  author?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  text?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  background?: string;
}
