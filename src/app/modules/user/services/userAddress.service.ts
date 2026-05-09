import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { UserAddress } from '../entities/userAddress.entity';

@Injectable()
export class UserAddressService extends BaseService<UserAddress> {
  constructor(
    @InjectRepository(UserAddress)
    public readonly userAddressRepository: Repository<UserAddress>,
  ) {
    super(userAddressRepository);
  }
}
