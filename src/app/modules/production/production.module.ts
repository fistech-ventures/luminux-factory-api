import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { RawMaterial } from '../rawMaterial/entities/rawMaterial.entity';
import { RawMaterialCombination } from '../rawMaterial/entities/rawMaterialCombination.entity';
import { ProductionInternalController } from './controllers/internal/production.internal.controller';
import { Production } from './entities/production.entity';
import { ProductionService } from './services/production.service';

@Module({
  imports: [TypeOrmModule.forFeature([Production, Product, RawMaterial, RawMaterialCombination])],
  providers: [ProductionService],
  exports: [ProductionService],
  controllers: [ProductionInternalController],
})
export class ProductionModule {}