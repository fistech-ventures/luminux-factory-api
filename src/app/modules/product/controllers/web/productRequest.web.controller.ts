import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SmsService } from '@src/app/modules/notification/services/sms.service';
import { FindOptionsRelations } from 'typeorm';
import { ProductRequestCreateDTO } from '../../dtos/productRequest/create.dto';
import { ProductRequest } from '../../entities/productRequest.entity';
import { ProductRequestService } from '../../services/productRequest.service';

@ApiTags('Product Request')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/product-requests')
export class ProductRequestWebController {
  constructor(
    private readonly service: ProductRequestService,
    private readonly smsService: SmsService
  ) { }
  RELATIONS: FindOptionsRelations<ProductRequest> = {};

  @Post()
  @Public()
  async create(@Body() body: ProductRequestCreateDTO): Promise<ProductRequest> {
    const created = await this.service.createOneBase(body);
    this.smsService.sendSmsThroughDefaultGateway({
      recipient: body.phoneNumber, message: `Dear ${body.name},
Your purchase request is recieved.
Thanks for choosing Fibonacci, Happy Reading!
We'll notify you as soon as we start processing your order.
Stay tuned!`
    })
    return created;
  }
}