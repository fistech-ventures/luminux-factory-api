import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RawMaterialCombination } from './rawMaterialCombination.entity';

@Entity(ENUM_TABLE_NAMES.RAW_MATERIALS, { orderBy: { createdAt: 'DESC' } })
export class RawMaterial extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'description'];

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  unit?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  warranty?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  image?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  stock?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  saleQuantity?: number;

  @OneToMany(() => RawMaterialCombination, (combination) => combination.rawMaterial)
  combinations?: RawMaterialCombination[];
}