import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.GALLERY, { orderBy: { createdAt: 'DESC' } })
export class Gallery extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'altText', 'url'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  caption?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  source?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  altText?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  url?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  key?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: false })
  mimetype?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: false })
  extension?: string;
}
