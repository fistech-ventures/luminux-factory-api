import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Form } from './form.entity';

@Entity(ENUM_TABLE_NAMES.FORM_SUBMITS, { orderBy: { createdAt: 'DESC' } })
export class FormSubmit extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ nullable: false, type: ENUM_COLUMN_TYPES.JSONB })
  submits?: any;

  @ManyToOne(() => Form, { onDelete: 'NO ACTION', nullable: false })
  form?: Form;

  @RelationId((e: FormSubmit) => e.form)
  @Column({ nullable: false })
  formId?: string;
}
