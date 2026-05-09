import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ENUM_SMS_GATEWAY_ACCOUNT_TYPE } from '../enums';

@Entity(ENUM_TABLE_NAMES.SMS_GATEWAYS, { orderBy: { createdAt: 'DESC' } })
export class SmsGateway extends BaseEntity {
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
    default: ENUM_SMS_GATEWAY_ACCOUNT_TYPE.DEFAULT,
  })
  accountType?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.VARCHAR,
    length: 50,
    nullable: false,
  })
  requestMethod?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.TEXT,
    nullable: false,
  })
  requestEndpoint?: string;

  @Column({
    type: ENUM_COLUMN_TYPES.JSONB,
    nullable: true,
  })
  requestBody?: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Type(() => User)
  user?: User;

  @RelationId((e: SmsGateway) => e.user)
  @Column({ nullable: true })
  userId?: string;
}
