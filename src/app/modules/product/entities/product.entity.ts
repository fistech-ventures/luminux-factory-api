import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Author } from '../../author/entities/author.entity';
import { Publication } from '../../publication/entities/publication.entity';
import { ENUM_PRODUCT_CONDITION, ENUM_PRODUCT_DISCOUNT_TYPE, ENUM_PRODUCT_SEGMENT, ENUM_PRODUCT_STATUS, ENUM_PRODUCT_STOCK_STATUS, ENUM_PRODUCT_TYPE } from '../const';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductCategory } from './productCategories.entity';
import { ProductGenre } from './productGenres.entity';
import { ProductMedia } from './productMedia.entity';
import { ProductQuestion } from './productQuestion.entity';
import { ProductReview } from './productReview.entity';
import { ProductVariantOption } from './productVariantOption.entity';
import { SourceShop } from './sourceShop.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCTS)
export class Product extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title', 'code', 'sku'];
  @Index()
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  subTitle?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: [] })
  alias?: any;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  slug?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, unique: true })
  code?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_TYPE.BOOK })
  type?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_SEGMENT.LITERATURE })
  segment?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_CONDITION.BENGALI_ORIGINAL })
  condition?: string;

  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: true, unique: true })
  sku?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  flap?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  description?: string;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true })
  specifications?: any;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  thumb?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  previewPdf?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  videoUrl?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  sourcingPrice?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  mrp?: number;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_DISCOUNT_TYPE.FLAT })
  discountType?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  discountAmount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  saleAmount?: number;

  @Column({
    type: 'numeric',
    generatedType: 'STORED',
    asExpression: `
    CASE
      WHEN "discountType" = 'flat' THEN ("discountAmount" / NULLIF(mrp, 0)) * 100
      WHEN "discountType" = 'percentage' THEN "discountAmount"
      ELSE NULL
    END
  `,
  })
  discountPercentage?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0, nullable: true })
  pageCount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, nullable: true })
  language?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, nullable: true })
  origin?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_STATUS.DRAFTED })
  status?: string;

  @Index()
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 35, default: ENUM_PRODUCT_STOCK_STATUS.IN_STOCK })
  stockStatus?: string;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  stockQuantity?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  saleQuantity?: number;

  @ManyToOne(() => Author, { onDelete: 'CASCADE' })
  author?: Author;

  @Index()
  @RelationId((e: Product) => e.author)
  @Column({ nullable: true })
  authorId?: string;

  @ManyToOne(() => Author, { onDelete: 'CASCADE' })
  translator?: Author;

  @Index()
  @RelationId((e: Product) => e.translator)
  @Column({ nullable: true })
  translatorId?: string;

  @ManyToOne(() => Publication, { onDelete: 'CASCADE' })
  publication?: Publication;

  @RelationId((e: Product) => e.publication)
  @Column({ nullable: true })
  publicationId?: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  category?: Category;

  @RelationId((e: Product) => e.category)
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => SourceShop, { onDelete: 'CASCADE' })
  sourceShop?: SourceShop;

  @RelationId((e: Product) => e.sourceShop)
  @Column({ nullable: true })
  sourceShopId?: string;

  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  brand?: Brand;

  @RelationId((e: Product) => e.brand)
  @Column({ nullable: true })
  brandId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isNewArrived?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isFeatured?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isFreeDelivery?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isForPreOrder?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  hasVariant?: boolean;

  @OneToMany(() => ProductVariantOption, (e) => e.product)
  variants?: ProductVariantOption[];

  // @OneToMany(() => ProductTag, (e) => e.product)
  // tags?: ProductTag[];

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB, default: []
  })
  tags?: any;

  @OneToMany(() => ProductGenre, (e) => e.product)
  genres?: ProductGenre[];

  @OneToMany(() => ProductMedia, (e) => e.product)
  medias?: ProductMedia[];

  @OneToMany(() => ProductCategory, (e) => e.product)
  categories?: ProductCategory[];

  @OneToMany(() => ProductQuestion, (e) => e.product)
  questions?: ProductQuestion[];

  @OneToMany(() => ProductReview, (e) => e.product)
  reviews?: ProductReview[];

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  ratingCount?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  ratingPointTotal?: number;

  @Column({ type: ENUM_COLUMN_TYPES.INT, default: 0 })
  ratingPointAvg?: number;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB, default: {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
    }
  })
  ratings?: any;
}