import { describe, expect, it, jest } from '@jest/globals';
import { DataSource, Repository } from 'typeorm';
import { RawMaterial } from '../entities/rawMaterial.entity';
import { RawMaterialCombination } from '../entities/rawMaterialCombination.entity';
import { RawMaterialService } from './rawMaterial.service';

describe('RawMaterialService', () => {
  it('does not save a stale combinations relation while updating combinations', async () => {
    const rawMaterial = { id: 'material-id', unit: 'Meter' };
    const existingCombination = {
      id: 'existing-id',
      title: 'Existing',
      stock: 0,
      sourcingPrice: 100,
      sellingPrice: 200,
      saleQuantity: 0,
    };
    const manager = {
      findOne: jest.fn().mockImplementation(async () => rawMaterial),
      find: jest.fn().mockImplementation(async () => [existingCombination]),
      save: jest.fn((_target: unknown, entity?: unknown) => Promise.resolve(entity ?? _target)),
    };
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager,
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    const repository = { findOne: jest.fn().mockImplementation(async () => rawMaterial) };
    const dataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    const service = new RawMaterialService(
      repository as unknown as Repository<RawMaterial>,
      dataSource as unknown as DataSource,
    );

    await service.updateRawMaterial('material-id', {
      combinations: [
        { id: 'existing-id', title: 'Existing', stock: 0, sourcingPrice: 100, sellingPrice: 200 },
        { title: 'New', stock: 1, sourcingPrice: 300, sellingPrice: 400 },
      ],
    });

    const parentSave = manager.save.mock.calls.find(([target]) => target === rawMaterial);
    expect(parentSave).toBeDefined();
    expect((parentSave?.[0] as RawMaterial).combinations).toBeUndefined();
    expect(manager.save.mock.calls.filter(([target]) => target === RawMaterialCombination)).toHaveLength(2);
  });
});