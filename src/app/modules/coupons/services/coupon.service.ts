import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CreateCouponDto } from '../dtos/create-coupon.dto';
import { UpdateCouponDto } from '../dtos/update-coupon.dto';
import { Coupon } from '../entities/coupon.entity';

@Injectable()
export class CouponService extends BaseService<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly _repo: Repository<Coupon>,
  ) {
    super(_repo);
  }

  RELATIONS: FindOptionsRelations<Coupon> = {
    usages: true,
  };

  async create(dto: CreateCouponDto): Promise<Coupon> {
    return this._repo.save({
      ...dto,
      createdBy: dto.createdBy,
      code: dto.code.toUpperCase(),
    });
  }

  async findAll(): Promise<Coupon[]> {
    return this.find({
      relations: this.RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.findByIdBase(id, { relations: this.RELATIONS });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this._repo.findOne({
      where: { code: code.toUpperCase() },
      relations: this.RELATIONS,
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    await this.isExist({ id });
    const updateData = { ...dto, updatedBy: dto.updatedBy };
    if (dto.code) {
      updateData.code = dto.code.toUpperCase();
    }
    await this._repo.save({ id, ...updateData });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.isExist({ id });
    await this.deleteOneBase(id);
  }

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = await this.isExist({ id });
    await this._repo.save({
      id,
      isActive: !coupon.isActive,
    });
    return this.findById(id);
  }
}
