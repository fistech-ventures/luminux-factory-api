import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { SuccessResponse } from '@src/app/types';
import { DataSource, FindOptionsRelations, In, Repository } from 'typeorm';
import { SubCategoryCreateDTO } from '../dtos/subCategory/create.dto';
import { SubCategoryUpdateDTO } from '../dtos/subCategory/update.dto';
import { SubCategory } from '../entities/subCategory.entity';

@Injectable()
export class SubCategoryService extends BaseService<SubCategory> {
  constructor(
    @InjectRepository(SubCategory)
    public readonly _repo: Repository<SubCategory>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  RELATIONS: FindOptionsRelations<SubCategory> = {
    category: true,
  };

  /**
   * Find all subcategories.
   * Optionally filtered by categoryId to get subcategories of a specific parent category.
   */
  async findAllSubCategories(
    filters: any & {
      searchTerm?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      categoryId?: string;
    },
  ): Promise<SuccessResponse<SubCategory[]>> {
    const { categoryId, ...restFilters } = filters;

    const where: any = {
      ...restFilters,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.findAllBase(where, { relations: this.RELATIONS });
  }

  /**
   * Find a single subcategory by ID.
   */
  async findSubCategoryById(id: string): Promise<SubCategory> {
    const subCategory = await this.findOne({
      where: { id },
      relations: this.RELATIONS,
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return subCategory;
  }

  /**
   * Create a subcategory.
   */
  async createSubCategory(payload: SubCategoryCreateDTO): Promise<SubCategory> {
    return this.createOneBase(payload as any, { relations: this.RELATIONS });
  }

  /**
   * Update a subcategory by ID.
   */
  async updateSubCategory(id: string, payload: SubCategoryUpdateDTO): Promise<SubCategory> {
    const subCategory = await this.findOne({
      where: { id },
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return this.updateOneBase(id, payload as any, { relations: this.RELATIONS });
  }

  /**
   * Delete a subcategory by ID.
   */
  async deleteSubCategory(id: string): Promise<SuccessResponse> {
    const subCategory = await this.findOne({
      where: { id },
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return this.deleteOneBase(id);
  }

  /**
   * Bulk delete subcategories.
   */
  async bulkDeleteSubCategories(ids: string[]): Promise<SuccessResponse> {
    const subCategories = await this.find({
      where: { id: In(ids) },
      select: { id: true },
    });
    if (subCategories.length !== ids.length) {
      throw new NotFoundException('One or more SubCategories not found');
    }
    return this.deleteBulkBase(ids);
  }
}
