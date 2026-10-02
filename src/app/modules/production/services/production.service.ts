import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, EntityManager, FindOptionsRelations, In, Repository } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { RawMaterial } from '../../rawMaterial/entities/rawMaterial.entity';
import { RawMaterialCombination } from '../../rawMaterial/entities/rawMaterialCombination.entity';
import { CreateProductionDTO } from '../dtos/create.dto';
import { Production, IProductionRawMaterialSnapshot } from '../entities/production.entity';

@Injectable()
export class ProductionService extends BaseService<Production> {
  constructor(
    @InjectRepository(Production) private readonly _repo: Repository<Production>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  public readonly RELATIONS: FindOptionsRelations<Production> = { product: true };

  async createProduction(payload: CreateProductionDTO): Promise<Production> {
    if (Boolean(payload.productId) === Boolean(payload.newProduct)) {
      throw new BadRequestException('Provide either an existing product or new product details');
    }
    if (!payload.usedRawMaterials?.length) {
      throw new BadRequestException('At least one raw material is required');
    }
    if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
      throw new BadRequestException('Production quantity must be greater than zero');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestedQuantities = new Map<
        string,
        { rawMaterialId: string; rawMaterialCombinationId?: string; quantity: number }
      >();
      for (const item of payload.usedRawMaterials) {
        if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
          throw new BadRequestException('Raw material quantity must be greater than zero');
        }
        const key = `${item.rawMaterialId}:${item.rawMaterialCombinationId ?? ''}`;
        const previous = requestedQuantities.get(key);
        requestedQuantities.set(key, {
          rawMaterialId: item.rawMaterialId,
          rawMaterialCombinationId: item.rawMaterialCombinationId,
          quantity: (previous?.quantity ?? 0) + item.quantity,
        });
      }

      const requests = [...requestedQuantities.values()];
      const materialIds = [...new Set(requests.map((request) => request.rawMaterialId))];
      const rawMaterials = await queryRunner.manager.find(RawMaterial, {
        where: { id: In(materialIds), isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });
      if (rawMaterials.length !== materialIds.length) {
        throw new NotFoundException('One or more raw materials were not found');
      }
      const combinations = await queryRunner.manager.find(RawMaterialCombination, {
        where: { rawMaterialId: In(materialIds), isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });
      const materialById = new Map(rawMaterials.map((material) => [material.id, material]));
      const combinationById = new Map(combinations.map((combination) => [combination.id, combination]));

      const snapshots: IProductionRawMaterialSnapshot[] = [];
      let materialCost = 0;
      for (const request of requests) {
        const rawMaterial = materialById.get(request.rawMaterialId);
        if (!rawMaterial) throw new NotFoundException('Raw material not found');
        const combination = request.rawMaterialCombinationId
          ? combinationById.get(request.rawMaterialCombinationId)
          : undefined;
        if (request.rawMaterialCombinationId && combination?.rawMaterialId !== rawMaterial.id) {
          throw new NotFoundException('Raw-material combination not found');
        }
        const activeCombinationExists = combinations.some(
          (candidate) => candidate.rawMaterialId === rawMaterial.id,
        );
        if (!combination && activeCombinationExists) {
          throw new BadRequestException('Select a raw-material combination for each material with combinations');
        }
        const quantity = request.quantity;
        const available = Number(combination?.stock ?? rawMaterial.stock) || 0;
        if (available < quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${combination?.title ?? rawMaterial.title ?? rawMaterial.id}"`,
          );
        }
        const sourcingPrice = Number(combination?.sourcingPrice ?? rawMaterial.sourcingPrice) || 0;
        const totalCost = quantity * sourcingPrice;
        materialCost += totalCost;
        if (combination) {
          combination.stock = available - quantity;
        } else {
          rawMaterial.stock = available - quantity;
        }
        snapshots.push({
          rawMaterialId: rawMaterial.id,
          rawMaterialCombinationId: combination?.id,
          title: rawMaterial.title ?? '',
          combinationTitle: combination?.title,
          code: combination?.code,
          unit: combination?.unit ?? rawMaterial.unit,
          quantity,
          sourcingPrice,
          totalCost,
        });
      }
      await queryRunner.manager.save(rawMaterials);
      if (combinations.length) await queryRunner.manager.save(combinations);
      for (const rawMaterial of rawMaterials) {
        const materialCombinations = combinations.filter(
          (combination) => combination.rawMaterialId === rawMaterial.id,
        );
        if (!materialCombinations.length) continue;
        const totalStock = materialCombinations.reduce(
          (sum, combination) => sum + (Number(combination.stock) || 0),
          0,
        );
        rawMaterial.stock = totalStock;
        rawMaterial.saleQuantity = materialCombinations.reduce(
          (sum, combination) => sum + (Number(combination.saleQuantity) || 0),
          0,
        );
        rawMaterial.sourcingPrice =
          totalStock > 0
            ? materialCombinations.reduce(
                (sum, combination) =>
                  sum +
                  (Number(combination.sourcingPrice) || 0) * (Number(combination.stock) || 0),
                0,
              ) / totalStock
            : materialCombinations.length
              ? materialCombinations.reduce(
                  (sum, combination) => sum + (Number(combination.sourcingPrice) || 0),
                  0,
                ) / materialCombinations.length
              : 0;
        rawMaterial.sellingPrice =
          totalStock > 0
            ? materialCombinations.reduce(
                (sum, combination) =>
                  sum +
                  (Number(combination.sellingPrice) || 0) * (Number(combination.stock) || 0),
                0,
              ) / totalStock
            : materialCombinations.length
              ? materialCombinations.reduce(
                  (sum, combination) => sum + (Number(combination.sellingPrice) || 0),
                  0,
                ) / materialCombinations.length
              : 0;
      }
      await queryRunner.manager.save(rawMaterials);

      const otherCost = Number(payload.otherCost) || 0;
      const totalProductionCost = materialCost + otherCost;
      const productionCostPerUnit = totalProductionCost / payload.quantity;
      let product: Product;
      let isNewProduct = false;

      if (payload.newProduct) {
        const productCode = payload.newProduct.productCode.trim();
        const duplicate = await queryRunner.manager.findOne(Product, {
          where: { productCode },
          withDeleted: true,
        });
        if (duplicate && !duplicate.isDeleted && !duplicate.deletedAt) {
          throw new BadRequestException(`Product code already exists: ${productCode}`);
        }

        product = await queryRunner.manager.save(
          Product,
          duplicate
            ? {
                ...duplicate,
                ...payload.newProduct,
                productCode,
                stock: payload.quantity,
                sourcingPrice: productionCostPerUnit,
                sellingPrice: payload.newProduct.sellingPrice ?? productionCostPerUnit,
                isDeleted: false,
                deletedAt: null,
              }
            : queryRunner.manager.create(Product, {
                ...payload.newProduct,
                productCode,
                stock: payload.quantity,
                sourcingPrice: productionCostPerUnit,
                sellingPrice: payload.newProduct.sellingPrice ?? productionCostPerUnit,
              }),
        );
        isNewProduct = true;
      } else {
        product = await this.findAndUpdateExistingProduct(
          queryRunner.manager,
          payload.productId!,
          payload.quantity,
          totalProductionCost,
          productionCostPerUnit,
        );
      }

      const production = queryRunner.manager.create(Production, {
        productId: product.id,
        quantity: payload.quantity,
        otherCost,
        totalProductionCost,
        productionCostPerUnit,
        usedRawMaterials: snapshots,
        isNewProduct,
      });
      const saved = await queryRunner.manager.save(production);

      await queryRunner.commitTransaction();
      return this.findByIdBase(saved.id, { relations: this.RELATIONS });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findAndUpdateExistingProduct(
    manager: EntityManager,
    productId: string,
    quantity: number,
    totalProductionCost: number,
    productionCostPerUnit: number,
  ): Promise<Product> {
    const product = await manager.findOne(Product, {
      where: { id: productId, isDeleted: false },
      lock: { mode: 'pessimistic_write' },
    });
    if (!product) throw new NotFoundException('Finished product not found');

    const currentStock = Number(product.stock) || 0;
    const updatedStock = currentStock + quantity;
    const updatedSourcingPrice =
      updatedStock > 0
        ? ((Number(product.sourcingPrice) || 0) * currentStock + totalProductionCost) / updatedStock
        : productionCostPerUnit;
    product.stock = updatedStock;
    product.sourcingPrice = updatedSourcingPrice;
    return manager.save(product);
  }
}