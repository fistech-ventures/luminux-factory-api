import { ENUM_COLUMN_TYPES } from '@src/shared';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: true })
  isActive?: boolean;

  // Soft-delete flag. Every table has this column (see migrations
  // 1791500000000-SoftDeleteAndFKFixes and 1793100000000-AddIsDeletedToAllTables)
  // and hard deletes are blocked at the database level, so deletion is done by
  // setting this to true. It must be declared here: TypeORM rejects
  // `repo.update(id, { isDeleted: true })` with EntityPropertyNotFoundError when
  // a property is missing from the entity metadata.
  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isDeleted?: boolean;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: {} })
  createdBy?: any;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, default: {} })
  updatedBy?: any;

  @Column({ type: ENUM_COLUMN_TYPES.JSONB, nullable: true, select: false, default: {} })
  deletedBy?: any;

  @CreateDateColumn({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  createdAt?: Date;

  @UpdateDateColumn({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  updatedAt?: Date;

  @DeleteDateColumn({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC, select: false })
  deletedAt?: Date;
}
