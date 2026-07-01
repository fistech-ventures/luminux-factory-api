import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddSubcategoryIdToProductsAndParentIdToCategories1782945107055 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add parentId column to categories table (self-referencing FK for subcategory hierarchy)
        await queryRunner.addColumn('categories', new TableColumn({
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
        }));

        // Add foreign key for parentId -> categories(id)
        await queryRunner.createForeignKey('categories', new TableForeignKey({
            name: 'FK_categories_parentId',
            columnNames: ['parentId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));

        // Add index on parentId for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_categories_parentId" ON "categories" ("parentId")`);

        // 2. Add subcategoryId column to products table (FK -> categories)
        await queryRunner.addColumn('products', new TableColumn({
            name: 'subcategoryId',
            type: 'uuid',
            isNullable: true,
        }));

        // Add foreign key for subcategoryId -> categories(id)
        await queryRunner.createForeignKey('products', new TableForeignKey({
            name: 'FK_products_subcategoryId',
            columnNames: ['subcategoryId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first (order matters — drop child FK before parent FK)
        await queryRunner.dropForeignKey('products', 'FK_products_subcategoryId');
        await queryRunner.dropForeignKey('categories', 'FK_categories_parentId');

        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_parentId"`);

        // Drop columns
        await queryRunner.dropColumn('products', 'subcategoryId');
        await queryRunner.dropColumn('categories', 'parentId');
    }
}
