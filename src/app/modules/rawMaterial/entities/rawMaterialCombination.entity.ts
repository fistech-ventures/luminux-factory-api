import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { RawMaterial } from './rawMaterial.entity';

@Entity(ENUM_TABLE_NAMES.RAW_MATERIAL_COMBINATIONS, { orderBy: { createdAt: 'DESC' } })
export class RawMaterialCombination extends BaseEntity {
  @ManyToOne(() => RawMaterial, (rawMaterial) => rawMaterial.combinations, { onDelete: 'RESTRICT' })
  rawMaterial?: RawMaterial;

  @Index()
  @RelationId((combination: RawMaterialCombination) => combination.rawMaterial)
  @Column({ nullable: false })
  rawMaterialId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: true })
  code?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 50, nullable: true })
  unit?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sellingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  stock?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  saleQuantity?: number;
}