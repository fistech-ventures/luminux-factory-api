import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateSubCategoriesTableAndMigrateData1742983000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create sub_categories table
        await queryRunner.createTable(new Table({
            name: 'sub_categories',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                    isUnique: true,
                },
                {
                    name: 'title',
                    type: 'varchar',
                    length: '256',
                    isNullable: false,
                },
                {
                    name: 'icon',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'banner',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'position',
                    type: 'int',
                    default: 0,
                    isNullable: false,
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                    isNullable: true,
                },
                {
                    name: 'categoryId',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp without time zone',
                    default: 'NOW()',
                    isNullable: true,
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp without time zone',
                    isNullable: true,
                },
                {
                    name: 'deletedAt',
                    type: 'timestamp without time zone',
                    isNullable: true,
                },
                {
                    name: 'createdBy',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'updatedBy',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'deletedBy',
                    type: 'uuid',
                    isNullable: true,
                },
            ],
        }));

        // Create index on title for search
        await queryRunner.query(`CREATE INDEX "IDX_sub_categories_title" ON "sub_categories" ("title")`);
        // Create index on categoryId for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_sub_categories_categoryId" ON "sub_categories" ("categoryId")`);

        // 2. Add foreign key for categoryId -> categories(id)
        await queryRunner.createForeignKey('sub_categories', new TableForeignKey({
            name: 'FK_sub_categories_categoryId',
            columnNames: ['categoryId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));

        // 3. Migrate existing subcategory data from categories table (where parentId IS NOT NULL)
        // First check if parentId column exists on categories
        const hasParentIdColumn = await queryRunner.hasColumn('categories', 'parentId');

        if (hasParentIdColumn) {
            // Insert existing subcategories into sub_categories table
            await queryRunner.query(`
                INSERT INTO "sub_categories" ("id", "title", "icon", "banner", "position", "isActive", "categoryId", "createdAt", "updatedAt", "createdBy", "updatedBy")
                SELECT 
                    "id", 
                    "title", 
                    "icon", 
                    "banner", 
                    "position", 
                    "isActive", 
                    "parentId" AS "categoryId", 
                    "createdAt", 
                    "updatedAt", 
                    "createdBy", 
                    "updatedBy"
                FROM "categories" 
                WHERE "parentId" IS NOT NULL
            `);

            // Drop old FK from products -> categories for subcategoryId
            const productsTable = await queryRunner.getTable('products');
            const productsSubcategoryFK = productsTable.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('subcategoryId') !== -1
            );
            if (productsSubcategoryFK) {
                await queryRunner.dropForeignKey('products', productsSubcategoryFK.name);
            }

            // Create new FK from products.subcategoryId -> sub_categories.id
            await queryRunner.createForeignKey('products', new TableForeignKey({
                name: 'FK_products_subcategoryId',
                columnNames: ['subcategoryId'],
                referencedTableName: 'sub_categories',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }));

            // Drop FK from categories for parentId
            const categoriesTable = await queryRunner.getTable('categories');
            const categoriesParentFK = categoriesTable.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('parentId') !== -1
            );
            if (categoriesParentFK) {
                await queryRunner.dropForeignKey('categories', categoriesParentFK.name);
            }

            // Drop parentId index
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_parentId"`);

            // Drop parentId column from categories
            await queryRunner.dropColumn('categories', 'parentId');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if sub_categories table exists
        const tableExists = await queryRunner.hasTable('sub_categories');
        if (!tableExists) {
            return;
        }

        // Check if parentId column already exists on categories
        const hasParentIdColumn = await queryRunner.hasColumn('categories', 'parentId');
        
        if (!hasParentIdColumn) {
            // Add parentId column back to categories
            await queryRunner.addColumn('categories', new TableColumn({
                name: 'parentId',
                type: 'uuid',
                isNullable: true,
            }));

            // Restore FK for parentId -> categories(id)
            await queryRunner.createForeignKey('categories', new TableForeignKey({
                name: 'FK_categories_parentId',
                columnNames: ['parentId'],
                referencedTableName: 'categories',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }));

            // Restore index on parentId
            await queryRunner.query(`CREATE INDEX "IDX_categories_parentId" ON "categories" ("parentId")`);

            // Migrate data back from sub_categories to categories
            const subCategories = await queryRunner.query(`SELECT * FROM "sub_categories"`);
            for (const sc of subCategories) {
                await queryRunner.query(
                    `UPDATE "categories" SET "parentId" = $1 WHERE "id" = $2`,
                    [sc.categoryId, sc.id]
                );
            }
        }

        // Drop FK from products -> sub_categories
        const productsTable = await queryRunner.getTable('products');
        const productsSubcategoryFK = productsTable.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('subcategoryId') !== -1
        );
        if (productsSubcategoryFK) {
            await queryRunner.dropForeignKey('products', productsSubcategoryFK.name);
        }

        // Restore FK from products.subcategoryId -> categories.id
        await queryRunner.createForeignKey('products', new TableForeignKey({
            name: 'FK_products_subcategoryId',
            columnNames: ['subcategoryId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));

        // Drop sub_categories table
        await queryRunner.dropTable('sub_categories');
    }
}
