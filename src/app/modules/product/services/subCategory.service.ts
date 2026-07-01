import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { SuccessResponse } from '@src/app/types';
import { DataSource, FindOptionsRelations, In, IsNull, Not, Repository } from 'typeorm';
import { SubCategoryCreateDTO } from '../dtos/subCategory/create.dto';
import { SubCategoryUpdateDTO } from '../dtos/subCategory/update.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class SubCategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    public readonly _repo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  RELATIONS: FindOptionsRelations<Category> = {
    parent: true,
  };

  /**
   * Find all subcategories (categories that have a parent).
   * Optionally filtered by parentId to get subcategories of a specific parent.
   */
  async findAllSubCategories(
    filters: any & {
      searchTerm?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      parentId?: string;
    },
  ): Promise<SuccessResponse<Category[]>> {
    const { parentId, ...restFilters } = filters;

    // Always enforce parentId IS NOT NULL (only subcategories)
    const where: any = {
      ...restFilters,
      parentId: parentId ? parentId : Not(IsNull()),
    };

    return this.findAllBase(where, { relations: this.RELATIONS });
  }

  /**
   * Find a single subcategory by ID. Ensures it has a parentId.
   */
  async findSubCategoryById(id: string): Promise<Category> {
    const subCategory = await this.findOne({
      where: { id, parentId: Not(IsNull()) },
      relations: this.RELATIONS,
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return subCategory;
  }

  /**
   * Create a subcategory (parentId is required).
   */
  async createSubCategory(payload: SubCategoryCreateDTO): Promise<Category> {
    return this.createOneBase(payload as any, { relations: this.RELATIONS });
  }

  /**
   * Update a subcategory by ID. Ensures it has a parentId.
   */
  async updateSubCategory(id: string, payload: SubCategoryUpdateDTO): Promise<Category> {
    const subCategory = await this.findOne({
      where: { id, parentId: Not(IsNull()) },
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return this.updateOneBase(id, payload as any, { relations: this.RELATIONS });
  }

  /**
   * Delete a subcategory by ID. Ensures it has a parentId.
   */
  async deleteSubCategory(id: string): Promise<SuccessResponse> {
    const subCategory = await this.findOne({
      where: { id, parentId: Not(IsNull()) },
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }
    return this.deleteOneBase(id);
  }

  /**
   * Bulk delete subcategories. Ensures all have parentId.
   */
  async bulkDeleteSubCategories(ids: string[]): Promise<SuccessResponse> {
    const subCategories = await this.find({
      where: { id: In(ids), parentId: Not(IsNull()) },
      select: { id: true },
    });
    if (subCategories.length !== ids.length) {
      throw new NotFoundException('One or more SubCategories not found');
    }
    return this.deleteBulkBase(ids);
  }
}
