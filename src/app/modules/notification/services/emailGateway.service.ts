import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { IFindBaseOptions } from '@src/app/interfaces';
import { Repository } from 'typeorm';
import { EmailGatewayCreateDTO } from '../dtos/emailGateway/create.dto';
import { EmailGatewayUpdateDTO } from '../dtos/emailGateway/update.dto';
import { EmailGateway } from '../entities/emailGateway.entity';
import { ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE } from '../enums';

@Injectable()
export class EmailGatewayService extends BaseService<EmailGateway> {
  constructor(
    @InjectRepository(EmailGateway)
    public readonly _repo: Repository<EmailGateway>,
  ) {
    super(_repo);
  }

  async createOne(
    payload: EmailGatewayCreateDTO,
    options?: IFindBaseOptions<EmailGateway>,
  ): Promise<EmailGateway> {
    if (payload.accountType === ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT && payload.isActive) {
      await this.repo.update(
        { accountType: ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT },
        { isActive: false },
      );
    }
    return this.createOneBase(payload, options);
  }

  async updateOne(
    id: string,
    payload: EmailGatewayUpdateDTO,
    options: IFindBaseOptions<EmailGateway>,
  ): Promise<EmailGateway> {
    const isExist = await this.findOne({ where: { id } });
    if (!isExist) {
      throw new BadRequestException('Gateway not found');
    }

    if (
      (payload.accountType === ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT ||
        isExist.accountType === ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT) &&
      payload.isActive
    ) {
      await this.repo.update(
        { accountType: ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT },
        { isActive: false },
      );
    }
    return this.updateOneBase(id, payload, options);
  }
}
