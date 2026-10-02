import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { RawMaterialCreateDTO } from '../dtos/create.dto';
import { RawMaterial } from '../entities/rawMaterial.entity';
import { RawMaterialCombination } from '../entities/rawMaterialCombination.entity';

@Injectable()
export class RawMaterialService extends BaseService<RawMaterial> {
  constructor(
    @InjectRepository(RawMaterial) private readonly _repo: Repository<RawMaterial>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  public readonly RELATIONS: FindOptionsRelations<RawMaterial> = { combinations: true };

  async createRawMaterial(payload: RawMaterialCreateDTO): Promise<RawMaterial> {
    const { combinations, ...rawMaterialData } = payload;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rawMaterial = await queryRunner.manager.save(
        RawMaterial,
        queryRunner.manager.create(RawMaterial, rawMaterialData),
      );
      if (combinations?.length) {
        const savedCombinations = await queryRunner.manager.save(
          RawMaterialCombination,
          combinations.map((combination) => ({
            ...combination,
            unit: combination.unit ?? rawMaterial.unit,
            rawMaterialId: rawMaterial.id,
          })),
        );
        this.applyAggregates(rawMaterial, savedCombinations);
        await queryRunner.manager.save(rawMaterial);
      }

      await queryRunner.commitTransaction();
      return this._repo.findOne({ where: { id: rawMaterial.id }, relations: this.RELATIONS });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRawMaterial(id: string, payload: Partial<RawMaterialCreateDTO>): Promise<RawMaterial> {
    const { combinations, ...rawMaterialData } = payload;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rawMaterial = await queryRunner.manager.findOne(RawMaterial, {
        where: { id, isDeleted: false },
        relations: { combinations: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rawMaterial) throw new NotFoundException('Raw material not found');
      Object.assign(rawMaterial, rawMaterialData);

      if (combinations !== undefined) {
        const current = (rawMaterial.combinations ?? []).filter((combination) => !combination.isDeleted);
        const currentById = new Map(current.map((combination) => [combination.id, combination]));
        const submittedIds = new Set(combinations.map((combination) => combination.id).filter(Boolean));
        const saved: RawMaterialCombination[] = [];

        for (const combinationData of combinations) {
          const existing = combinationData.id ? currentById.get(combinationData.id) : undefined;
          if (combinationData.id && !existing) {
            throw new BadRequestException('Combination does not belong to this raw material');
          }
          saved.push(
            await queryRunner.manager.save(RawMaterialCombination, {
              ...existing,
              ...combinationData,
              unit: combinationData.unit ?? rawMaterial.unit,
              rawMaterialId: rawMaterial.id,
              isDeleted: false,
              deletedAt: null,
            }),
          );
        }

        for (const combination of current) {
          if (submittedIds.has(combination.id)) continue;
          if ((Number(combination.stock) || 0) > 0) {
            throw new BadRequestException(
              `Cannot remove combination "${combination.title}" while it has stock`,
            );
          }
          combination.isDeleted = true;
          combination.deletedAt = new Date();
          await queryRunner.manager.save(combination);
        }

        this.applyAggregates(rawMaterial, saved);
      }

      await queryRunner.manager.save(rawMaterial);
      await queryRunner.commitTransaction();
      return this._repo.findOne({ where: { id }, relations: this.RELATIONS });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private applyAggregates(rawMaterial: RawMaterial, combinations: RawMaterialCombination[]): void {
    const active = combinations.filter((combination) => !combination.isDeleted);
    const totalStock = active.reduce((sum, combination) => sum + (Number(combination.stock) || 0), 0);
    const weightedAverage = (key: 'sourcingPrice' | 'sellingPrice'): number => {
      if (totalStock > 0) {
        return active.reduce(
          (sum, combination) =>
            sum + (Number(combination[key]) || 0) * (Number(combination.stock) || 0),
          0,
        ) / totalStock;
      }
      return active.length
        ? active.reduce((sum, combination) => sum + (Number(combination[key]) || 0), 0) / active.length
        : 0;
    };

    rawMaterial.stock = totalStock;
    rawMaterial.saleQuantity = active.reduce(
      (sum, combination) => sum + (Number(combination.saleQuantity) || 0),
      0,
    );
    rawMaterial.sourcingPrice = weightedAverage('sourcingPrice');
    rawMaterial.sellingPrice = weightedAverage('sellingPrice');
  }
}