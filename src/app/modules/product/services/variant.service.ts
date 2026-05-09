import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { asyncForEach } from '@src/shared';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { VariantOption } from '../entities/variantOption.entity';
@Injectable()
export class VariantService extends BaseService<Variant> {
  constructor(
    @InjectRepository(Variant)
    public readonly _repo: Repository<Variant>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  async createOne(data): Promise<Variant> {
    const { options, ...variant } = data;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedVariant = await queryRunner.manager.save(Variant, variant);
      if (options?.length) {
        await asyncForEach(options, async (op) => {
          await queryRunner.manager.save(VariantOption, {
            ...op,
            variantId: savedVariant?.id,
          });
        });
      }
      await queryRunner.commitTransaction();
      return this.findByIdBase(savedVariant?.id, { relations: { options: true } });
    } catch (error) {
      console.info('🚀 ~ VariantService ~ createOne ~ error:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong while saving variant data!');
    } finally {
      await queryRunner.release();
    }
  }

  async updateOne(id: string, data): Promise<Variant> {
    const { options, ...variantData } = data;
    const isExist = await this.findByIdBase(id);
    if (!isExist) throw new NotFoundException('Question data not found!');
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Variant, { id }, variantData);
      if (options?.length) {
        await asyncForEach(options, async (op) => {
          if (op?.isDeleted) {
            await queryRunner.manager.delete(VariantOption, {
              id: op.id,
              variantId: id,
            });
          } else {
            await queryRunner.manager.save(VariantOption, {
              ...op,
              variantId: id,
            });
          }
        });
      }
      await queryRunner.commitTransaction();
      return this.findByIdBase(id);
    } catch (error) {
      console.info('🚀 ~ VariantService ~ updateOne ~ error:', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Something went wrong while saving variant data!');
    } finally {
      await queryRunner.release();
    }
  }
}