import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity(ENUM_TABLE_NAMES.AUTHORS, { orderBy: { createdAt: 'DESC' } })
export class Author extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['name'];

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 250, nullable: false })
  name?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  image?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  featuredImage?: string;

  @Column({ type: ENUM_COLUMN_TYPES.TEXT, nullable: true })
  introduction?: string;

  @Column({ type: ENUM_COLUMN_TYPES.VARCHAR, length: 10, nullable: true })
  dob?: string;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: false })
  isFeaturedOnBirthday?: boolean;

  @OneToOne(() => User, (user) => user.author, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  user?: User;

  @RelationId((author: Author) => author.user)
  @Column({ nullable: true })
  userId?: string;
}
