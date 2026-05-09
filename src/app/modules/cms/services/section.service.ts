import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { IFindBaseOptions } from '@src/app/interfaces';
import { asyncForEach } from '@src/shared';
import { isNotEmptyObject } from 'class-validator';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { SectionCreateDTO } from '../dtos/section/create.dto';
import { SectionUpdateDTO } from '../dtos/section/update.dto';
import { PageSection } from '../entities/pageSection.entity';
import { Section } from '../entities/section.entity';
import { SectionItem } from '../entities/sectionItems.entity';

@Injectable()
export class SectionService extends BaseService<Section> {
  constructor(
    @InjectRepository(Section)
    private readonly _repo: Repository<Section>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  async createOne(
    payload: SectionCreateDTO,
    options: IFindBaseOptions<Section>,
  ): Promise<Section> {
    const { items, ...restPayload } = payload;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let createdSection: Section;
    try {
      createdSection = await queryRunner.manager.save(Section, restPayload);
      if (restPayload?.pageId)
        await queryRunner.manager.save(PageSection, { pageId: restPayload.pageId, sectionId: createdSection.id });

      if (items && items.length) {
        await asyncForEach(items, async (item) => {
          await queryRunner.manager.save(SectionItem, {
            ...item,
            sectionId: createdSection.id,
          } satisfies Partial<SectionItem>);
        });
      }
      await queryRunner.commitTransaction();
      return this.findByIdBase(createdSection?.id, options);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async updateOne(
    id: string,
    payload: SectionUpdateDTO,
    options: IFindBaseOptions<Section>,
  ): Promise<Section> {
    const { items, ...restPayload } = payload;

    const isExist = await this.repo.exists({ where: { id } });
    if (!isExist) {
      throw new NotFoundException('Subscription plan not found');
    }

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isNotEmptyObject(restPayload)) {
        await queryRunner.manager.update(Section, { id }, restPayload);
      }

      if (items && items.length) {
        const deletedItems = items.filter((d) => d.id && d.isDeleted);
        if (deletedItems?.length)
          await queryRunner.manager.delete(SectionItem, deletedItems?.map((d) => d.id));

        const newItems = items.filter((d) => !d.id);
        await asyncForEach(newItems, async (d) => {
          delete d.isDeleted;
          await queryRunner.manager.save(SectionItem, {
            ...d,
            sectionId: id,
          } satisfies Partial<SectionItem>);
        });

        const updatedItems = items.filter((d) => d.id && !d.isDeleted);
        await asyncForEach(updatedItems, async (d) => {
          delete d.isDeleted;
          await queryRunner.manager.update(SectionItem, d.id, d);
        });
      }

      await queryRunner.commitTransaction();
      return this.findByIdBase(id, options);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
