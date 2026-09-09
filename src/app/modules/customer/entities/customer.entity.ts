import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_CUSTOMER_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity(ENUM_TABLE_NAMES.CUSTOMERS, { orderBy: { createdAt: 'DESC' } })
export class Customer extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name', 'contactNumber', 'email', 'companyName'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: false, default: ENUM_CUSTOMER_TYPES.B2C })
  customerType?: ENUM_CUSTOMER_TYPES;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false })
  contactNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 150, nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  address?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: true })
  companyName?: string;

  @OneToMany(() => Sale, (sale) => sale.customer)
  sales?: Sale[];
}
