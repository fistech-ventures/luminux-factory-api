import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, OneToMany } from 'typeorm';
import { Purchase } from '../../purchase/entities/purchase.entity';

@Entity(ENUM_TABLE_NAMES.SUPPLIERS, { orderBy: { createdAt: 'DESC' } })
export class Supplier extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['companyName', 'contactPerson', 'contactNumber', 'email'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  companyName?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 255, nullable: false })
  contactPerson?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 20, nullable: false })
  contactNumber?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 150, nullable: true })
  email?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: false })
  address?: string;

  @OneToMany(() => Purchase, (purchase) => purchase.supplier)
  purchases?: Purchase[];
}
