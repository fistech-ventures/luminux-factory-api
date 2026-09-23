import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.EMPLOYEES, { orderBy: { createdAt: 'DESC' } })
export class Employee extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [
    'name',
    'employeeId',
    'phoneNumber',
    'email',
    'designation',
  ];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  name?: string;

  // Human-facing employee code (e.g. EMP-001). Unique per employee.
  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 100, nullable: false, unique: true })
  employeeId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false })
  phoneNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 150, nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  designation?: string;
}
