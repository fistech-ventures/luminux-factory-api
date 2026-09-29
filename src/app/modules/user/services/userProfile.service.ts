import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HtmlHelper } from '@src/app/helpers';
import { IFindBaseOptions } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { generateCode } from '@src/shared';
import { pruneSoftDeleted } from '@src/shared/utils/dborm.utils';
import {
  commitTransaction,
  findAllByRepo,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { isNotEmptyObject } from 'class-validator';
import { Between, DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { UserProfileCreateDTO } from '../dtos/userProfile/create.dto';
import { UserProfileFilterDTO } from '../dtos/userProfile/filter.dto';
import { UserProfileUpdateDTO, UserProfileVerifyDTO } from '../dtos/userProfile/update.dto';
import { UserProfile } from '../entities/userProfile.entity';
import { R2FileUploadService } from '../../gallery/services/r2FileUpload.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly repo: Repository<UserProfile>,
    private readonly dataSource: DataSource,
    private readonly htmlHelper: HtmlHelper,
    private readonly fileUploadService: R2FileUploadService,
  ) { }

  async findById(id: string, options?: IFindBaseOptions<UserProfile>): Promise<UserProfile> {
    const opts: FindOneOptions = {
      where: { id, isDeleted: false },
    };
    if (options?.select) opts.select = options?.select;
    if (options?.relations) opts.relations = options?.relations;

    return pruneSoftDeleted(await this.repo.findOne(opts));
  }

  async findOne(
    filters: UserProfile,
    options?: IFindBaseOptions<UserProfile>,
  ): Promise<UserProfile> {
    const opts: FindOneOptions = {
      where: {
        ...filters,
        isDeleted: false,
      },
    };
    if (options?.select) opts.select = options?.select;
    if (options?.relations) opts.relations = options?.relations;
    return pruneSoftDeleted(await this.repo.findOne(opts));
  }

  async findAll(
    query: UserProfileFilterDTO,
    options?: IFindBaseOptions<UserProfile>,
  ): Promise<SuccessResponse<UserProfile[]>> {
    if (query.maxAge) {
      const maxAge = Number(query.maxAge);
      const now = new Date();
      const backDate = new Date(now.getFullYear() - maxAge, 0, 1);
      query['dateOfBirth'] = Between(backDate, now);
      delete query.maxAge;
    }
    return findAllByRepo(this.repo, query, options);
  }

  async generateUniqueCode(queryRunner: QueryRunner): Promise<string> {
    let counter = 0;
    let isExist = true;
    let code: string;

    while (isExist) {
      code = `${generateCode('W')}${counter}`;

      isExist = await queryRunner.manager.exists(UserProfile, {
        where: { code },
        withDeleted: true,
      });

      if (isExist) {
        counter++;
      }
    }
    return code;
  }

  async createOne(
    payload: UserProfileCreateDTO,
    options?: IFindBaseOptions<UserProfile>,
  ): Promise<UserProfile> {

    const existingProfile = await this.repo.findOne({
      where: { userId: payload.userId },
      withDeleted: true,
    });

    if (existingProfile && !existingProfile.isDeleted && !existingProfile.deletedAt) {
      throw new BadRequestException('Worker Profile already exists for this user!');
    }

    if (existingProfile) {
      await this.repo.save({
        ...existingProfile,
        ...payload,
        isDeleted: false,
        deletedAt: null,
      });
      return this.findById(existingProfile.id, options);
    }

    const queryRunner = await startTransaction(this.dataSource);

    let createdProfile: UserProfile;
    try {
      const code = await this.generateUniqueCode(queryRunner);
      createdProfile = await queryRunner.manager.save(UserProfile, { ...payload, code });
      await commitTransaction(queryRunner);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw error;
    }

    if (createdProfile) {
      return this.findById(createdProfile.id, options);
    }
  }

  async updateOne(
    id: string,
    payload: UserProfileUpdateDTO,
    options: IFindBaseOptions<UserProfile>,
  ): Promise<UserProfile> {

    const isExist = await this.repo.exists({ where: { id, isDeleted: false } });
    if (!isExist) {
      throw new NotFoundException('Worker Profile not found');
    }

    const queryRunner = await startTransaction(this.dataSource);

    try {
      if (isNotEmptyObject(payload)) {
        await queryRunner.manager.update(UserProfile, { id }, payload);
      }

      await commitTransaction(queryRunner);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw error;
    }
    return this.findById(id, options);
  }

  async verify(
    id: string,
    payload: UserProfileVerifyDTO,
    options: IFindBaseOptions<UserProfile>,
  ): Promise<UserProfile> {
    const isExist = await this.repo.exists({ where: { id, isDeleted: false } });
    if (!isExist) {
      throw new NotFoundException('Worker Profile not found');
    }

    await this.repo.update({ id }, { isVerified: payload.isVerified });

    return this.findById(id, options);
  }

}
