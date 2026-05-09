import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { IAuthUser } from '@src/app/interfaces';
import { Repository } from 'typeorm';
import { ProductReviewCreateDTO } from '../dtos/productReview/create.dto';
import { ProductReview } from '../entities/productReview.entity';
import { ProductService } from './product.service';

@Injectable()
export class ProductReviewService extends BaseService<ProductReview> {
  constructor(
    @InjectRepository(ProductReview)
    private readonly _repo: Repository<ProductReview>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService
  ) {
    super(_repo);
  }

  async createOne(data: ProductReviewCreateDTO, authUser?: IAuthUser): Promise<ProductReview> {
    if (!data?.userId)
      data['userId'] = authUser.id
    const created = await this.createOneBase(data);
    this.productService.applyNewRating(data.productId, data.rating)
    return created;
  }
}
