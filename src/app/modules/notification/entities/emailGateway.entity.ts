import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE } from '../enums';

@Entity(ENUM_TABLE_NAMES.EMAIL_GATEWAYS, { orderBy: { createdAt: 'DESC' } })
export class EmailGateway extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 225,
    nullable: false,
  })
  title?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 50,
    nullable: false,
    default: ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT,
  })
  accountType?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 50,
    nullable: true,
  })
  type?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: false,
  })
  host?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.INT,
    nullable: false,
  })
  port?: number;

  @Column({
    type: ENUM_COLUMN_TYPES.BOOLEAN,
    nullable: false,
  })
  isSecure?: boolean;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: false,
  })
  authUser?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: false,
  })
  authPassword?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: false,
  })
  senderEmail?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 100,
    nullable: true,
  })
  senderLabel?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Type(() => User)
  user?: User;

  @RelationId((e: EmailGateway) => e.user)
  @Column({ nullable: true })
  userId?: string;
}
