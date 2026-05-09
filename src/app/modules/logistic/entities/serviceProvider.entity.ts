import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.SERVICE_PROVIDER, { orderBy: { createdAt: 'DESC' } })
export class ServiceProvider extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false, unique: true })
  uniqueIdentifier?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  icon?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  type?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB,
    nullable: true,
  })
  apiConfig?: any;
}
