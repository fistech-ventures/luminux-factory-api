import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.SOURCE_SHOPS)
export class SourceShop extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];
  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: false })
  title?: string;

  @Column({ nullable: true })
  contactPerson?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true, type: "jsonb" })
  location?: any;
}