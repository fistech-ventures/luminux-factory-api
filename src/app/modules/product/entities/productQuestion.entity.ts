import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, OneToOne, RelationId } from 'typeorm';
import { ENUM_PRODUCT_QUESTION_ANSWER_STATUS } from '../const';
import { Product } from './product.entity';
import { ProductQuestionAnswer } from './productQuestionAnswer.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_QUESTIONS, { orderBy: { createdAt: 'DESC' } })
export class ProductQuestion extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['statement'];
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  statement?: string;

  @Index()
  @Column({ length: 25, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, default: ENUM_PRODUCT_QUESTION_ANSWER_STATUS.PENDING })
  status?: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @Index()
  @RelationId((e: ProductQuestion) => e.product)
  @Column({ nullable: false })
  productId?: string;

  @OneToOne(() => ProductQuestionAnswer, (answer) => answer.question, {
    nullable: true,
  })
  answer?: ProductQuestionAnswer;

  @RelationId((question: ProductQuestion) => question.answer)
  @Column({ nullable: true })
  answerId?: string;
}
