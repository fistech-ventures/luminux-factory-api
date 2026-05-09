import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ProductReviewCreateDTO } from '../../dtos/productReview/create.dto';
import { ProductReviewFilterDTO } from '../../dtos/productReview/filter.dto';
import { ProductReview } from '../../entities/productReview.entity';
import { ProductReviewService } from '../../services/productReview.service';
import { ENUM_PRODUCT_REVIEW_STATUS } from '../../const';

@ApiTags('Product Review')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/product-reviews')
export class ProductReviewWebController {
  constructor(
    private readonly service: ProductReviewService
  ) { }
  RELATIONS: FindOptionsRelations<ProductReview> = { user: true };

  @Public()
  @Get()
  async findAll(@Query() query: ProductReviewFilterDTO): Promise<SuccessResponse<ProductReview[]>> {
    query['status'] = ENUM_PRODUCT_REVIEW_STATUS.PUBLISHED;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductReviewCreateDTO, @AuthUser() authUser: IAuthUser): Promise<ProductReview> {
    // const checkOrderData = await this.productService.checkProductIfOrderdByUser(authUser.id, body.productId)
    // if (checkOrderData.data.hasOrdered)
    body['userId'] = authUser.id;
    body['source'] = 'web';
    return this.service.createOne(body);
    // else throw new BadRequestException('You must order & receieve the product to share review!')
  }
}