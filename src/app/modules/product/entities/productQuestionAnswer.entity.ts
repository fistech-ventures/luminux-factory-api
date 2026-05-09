import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, JoinColumn, OneToOne, RelationId } from 'typeorm';
import { ENUM_PRODUCT_QUESTION_ANSWER_STATUS } from '../const';
import { ProductQuestion } from './productQuestion.entity';

@Entity(ENUM_TABLE_NAMES.PRODUCT_QUESTION_ANSWERS, { orderBy: { createdAt: 'DESC' } })
export class ProductQuestionAnswer extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['statement'];
  @Column({ length: 256, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false })
  statement?: string;

  @Column({ length: 25, type: ENUM_COLUMN_TYPES.VARCHAR, nullable: false, default: ENUM_PRODUCT_QUESTION_ANSWER_STATUS.PUBLISHED })
  status?: string;

  @OneToOne(() => ProductQuestion, (productQuestion) => productQuestion.answer, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn()
  question?: ProductQuestion;

  @Index()
  @RelationId((answer: ProductQuestionAnswer) => answer.question)
  @Column({ nullable: false })
  questionId?: string;
}
