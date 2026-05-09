import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProviderServiceRequest } from '../entities/providerServiceRequest.entity';

@Injectable()
export class ProviderServiceRequestService extends BaseService<ProviderServiceRequest> {
  constructor(
    @InjectRepository(ProviderServiceRequest)
    private readonly _repo: Repository<ProviderServiceRequest>,
  ) {
    super(_repo);
  }
}
