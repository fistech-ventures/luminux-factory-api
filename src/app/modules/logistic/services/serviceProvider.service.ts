import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { QueryRunner, Repository } from 'typeorm';
import { ServiceProvider } from '../entities/serviceProvider.entity';
import { ProviderServiceRequest } from '../entities/providerServiceRequest.entity';
import { IAuthUser } from '@src/app/interfaces';
import { Order } from '../../order/entities/order.entity';
import { CourierFactory } from './courier.factory';
import axios from 'axios';

@Injectable()
export class ServiceProviderService extends BaseService<ServiceProvider> {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly _repo: Repository<ServiceProvider>,
    // private readonly providerServiceRequestService: ProviderServiceRequestService,

  ) {
    super(_repo);
  }

  async createRequest(
    serviceProviderId: string,
    orderData: Order,
    authUser: IAuthUser,
    queryRunner: QueryRunner
  ): Promise<void> {
    try {

      const serviceProvider = await this.isExist({ id: serviceProviderId });
      const { apiConfig, uniqueIdentifier } = serviceProvider;

      const courier = CourierFactory.getProvider(uniqueIdentifier);

      const headers = courier.buildHeaders(apiConfig);
      const payload = courier.buildPayload(orderData);

      // here you call courier API
      try {
        const providerResponse = await axios.post(courier.endpoint, payload, { headers })
        console.info("🚀 ~ ServiceProviderService ~ createRequest ~ providerResponse:", providerResponse)
      } catch (error) {
        console.error("🚀 ~ ServiceProviderService ~ createRequest ~ error:", error)
        throw new Error(error.message)
      }

      await queryRunner.manager.save(ProviderServiceRequest, {
        status: "Ready To Ship",
        providerTrackingCode: null,
        orderCode: orderData.code,
        serviceType: serviceProvider.type,
        orderId: orderData.id,
        serviceProviderId,
        changeTrack: [
          {
            time: new Date(),
            status: "Ready To Ship",
            note: "Order is ready to ship",
          },
        ],
        createdBy: authUser,
      });

    } catch (error) {
      console.error("🚀 createRequest error:", error);
      throw new Error(error.message);
    }
  }
}
