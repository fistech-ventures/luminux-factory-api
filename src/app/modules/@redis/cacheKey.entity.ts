import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.CACHE_KEYS, { orderBy: { createdAt: 'DESC' } })
export class CacheKey extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = ['title'];

  @Column({ unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column('bigint', { nullable: true })
  ttl: number; // Store TTL as a timestamp
}
