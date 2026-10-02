import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

export interface IProductionRawMaterialSnapshot {
  rawMaterialId: string;
  rawMaterialCombinationId?: string;
  title: string;
  combinationTitle?: string;
  code?: string;
  unit?: string;
  quantity: number;
  sourcingPrice: number;
  totalCost: number;
}

@Entity(ENUM_TABLE_NAMES.PRODUCTIONS, { orderBy: { createdAt: 'DESC' } })
export class Production extends BaseEntity {
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  product?: Product;

  @Index()
  @RelationId((production: Production) => production.product)
  @Column({ nullable: false })
  productId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  otherCost?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  totalProductionCost?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  productionCostPerUnit?: number;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: false, default: [] })
  usedRawMaterials?: IProductionRawMaterialSnapshot[];

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, nullable: false, default: false })
  isNewProduct?: boolean;
}