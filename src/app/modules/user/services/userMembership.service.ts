import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { generateCode } from '@src/shared';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserMembership } from '../entities/userMembership.entity';
import { UserService } from './user.service';

@Injectable()
export class UserMembershipService extends BaseService<UserMembership> {
  constructor(
    @InjectRepository(UserMembership)
    public readonly userMembershipRepository: Repository<UserMembership>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,

  ) {
    super(userMembershipRepository);
  }
  async createOne(body: Partial<UserMembership>): Promise<UserMembership> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const code = await this.generateUniqueCode(queryRunner);
      let isUserExist = await queryRunner.manager.findOne(User, {
        where: [{ phoneNumber: body.phoneNumber }, { email: body.email }],
      });
      if (!isUserExist) {
        isUserExist = await this.userService.findOrCreateByPhoneNumber(body.phoneNumber, body.name);
      }
      const isMembershipExist = await queryRunner.manager.exists(UserMembership, {
        where: { userId: isUserExist.id },
      });
      if (isMembershipExist) {
        throw new Error('User already has an active membership');
      }
      await queryRunner.manager.save(UserMembership, {
        ...body,
        code,
        userId: isUserExist.id,
      });
      await queryRunner.commitTransaction();
      return this.userMembershipRepository.findOne({ where: { code }, relations: { user: true } });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generateUniqueCode(queryRunner: QueryRunner): Promise<string> {
    let counter = 0;
    let isExist = true;
    let code: string;

    while (isExist) {
      code = `${generateCode('FIBO')}${counter}`;
      isExist = await queryRunner.manager.exists(UserMembership, {
        where: { code },
      });
      if (isExist) {
        counter++;
      }
    }
    return code;
  }
}
