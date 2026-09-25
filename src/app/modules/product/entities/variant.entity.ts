import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { VariantOption } from './variantOption.entity';

@Entity(ENUM_TABLE_NAMES.VARIANTS)
export class Variant extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'options.title'];
  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  title?: string;

  @OneToMany(() => VariantOption, (e) => e.variant)
  options?: VariantOption[];
}