import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';
import { ProductVariantSku } from '../../product/entities/productVariantSku.entity';
import { RawMaterial } from '../../rawMaterial/entities/rawMaterial.entity';
import { RawMaterialCombination } from '../../rawMaterial/entities/rawMaterialCombination.entity';

@Entity(ENUM_TABLE_NAMES.SALE_ITEMS, { orderBy: { createdAt: 'DESC' } })
export class SaleItem extends BaseEntity {
  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  sale?: Sale;

  @Index()
  @RelationId((item: SaleItem) => item.sale)
  @Column({ nullable: false })
  saleId?: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT', nullable: true })
  product?: Product;

  @Index()
  @RelationId((item: SaleItem) => item.product)
  @Column({ nullable: true })
  productId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false, default: 'product' })
  itemType?: 'product' | 'rawMaterial';

  @ManyToOne(() => RawMaterial, { onDelete: 'RESTRICT', nullable: true })
  rawMaterial?: RawMaterial;

  @Index()
  @RelationId((item: SaleItem) => item.rawMaterial)
  @Column({ nullable: true })
  rawMaterialId?: string;

  @ManyToOne(() => RawMaterialCombination, { onDelete: 'RESTRICT', nullable: true })
  rawMaterialCombination?: RawMaterialCombination;

  @Index()
  @RelationId((item: SaleItem) => item.rawMaterialCombination)
  @Column({ nullable: true })
  rawMaterialCombinationId?: string;

  @ManyToOne(() => ProductVariantOption, { onDelete: 'RESTRICT' })
  variant?: ProductVariantOption;

  @Index()
  @RelationId((item: SaleItem) => item.variant)
  @Column({ nullable: true })
  variantId?: string;

  @ManyToOne(() => ProductVariantSku, { onDelete: 'RESTRICT', nullable: true })
  sku?: ProductVariantSku;

  @Index()
  @RelationId((item: SaleItem) => item.sku)
  @Column({ nullable: true })
  skuId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  quantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  sellingPrice?: number;

  // Unit cost (product sourcing price) at the time of sale - a snapshot so
  // historical profit stays correct even if the sourcing price changes later.
  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  totalAmount?: number;
}
