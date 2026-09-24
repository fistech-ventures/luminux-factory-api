import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';

@Entity(ENUM_TABLE_NAMES.INVESTMENTS, { orderBy: { date: 'DESC', createdAt: 'DESC' } })
export class Investment extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];
  public static readonly DATE_FILTER_COLUMN: string = 'date';

  @Column({ type: ENUM_COLUMN_TYPES.DATE, nullable: false })
  date?: Date;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  title?: string;

  @Column({ type: ENUM_COLUMN_TYPES.FLOAT, nullable: false })
  amount?: number;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT' })
  investor?: Employee;

  @Index()
  @RelationId((investment: Investment) => investment.investor)
  @Column({ type: ENUM_COLUMN_TYPES.PRIMARY_KEY, nullable: false })
  investorId?: string;
}
