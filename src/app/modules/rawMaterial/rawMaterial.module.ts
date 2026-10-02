import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialInternalController } from './controllers/internal/rawMaterial.internal.controller';
import { RawMaterial } from './entities/rawMaterial.entity';
import { RawMaterialCombination } from './entities/rawMaterialCombination.entity';
import { RawMaterialService } from './services/rawMaterial.service';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterial, RawMaterialCombination])],
  providers: [RawMaterialService],
  exports: [RawMaterialService, TypeOrmModule],
  controllers: [RawMaterialInternalController],
})
export class RawMaterialModule {}