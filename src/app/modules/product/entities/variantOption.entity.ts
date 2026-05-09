import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Variant } from './variant.entity';

@Entity(ENUM_TABLE_NAMES.VARIANT_OPTIONS, { orderBy: { createdAt: 'DESC' } })
export class VariantOption extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  title?: string;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE' })
  variant?: Variant;

  @RelationId((e: VariantOption) => e.variant)
  @Column({ nullable: false })
  variantId?: string;
}
