import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddWarrantyAndSkuValuePosition1790208003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const products = await queryRunner.getTable('products');
    if (products?.findColumnByName('description') && !products.findColumnByName('warranty')) {
      await queryRunner.renameColumn('products', 'description', 'warranty');
    } else if (products && !products.findColumnByName('warranty')) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({ name: 'warranty', type: 'text', isNullable: true }),
      );
    }

    const skuValues = await queryRunner.getTable('product_variant_sku_values');
    if (skuValues && !skuValues.findColumnByName('position')) {
      await queryRunner.addColumn(
        'product_variant_sku_values',
        new TableColumn({ name: 'position', type: 'int', default: 0 }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const products = await queryRunner.getTable('products');
    if (products?.findColumnByName('warranty') && !products.findColumnByName('description')) {
      await queryRunner.renameColumn('products', 'warranty', 'description');
    }

    const skuValues = await queryRunner.getTable('product_variant_sku_values');
    if (skuValues?.findColumnByName('position')) {
      await queryRunner.dropColumn('product_variant_sku_values', 'position');
    }
  }
}