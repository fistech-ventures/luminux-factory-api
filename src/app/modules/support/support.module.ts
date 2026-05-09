import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackInternalController } from './controllers/internal/feedback.internal.controller';
import { PanelTrainingInternalController } from './controllers/internal/panelTraining.internal.controller';
import { Feedback } from './entities/feedback.entity';
import { PanelTraining } from './entities/panelTraining.entity';
import { FeedbackService } from './services/feedback.service';
import { PanelTrainingService } from './services/panelTraining.service';

const entities = [PanelTraining, Feedback];
const services = [PanelTrainingService, FeedbackService];
const subscribers = [];
const controllers = [];
const internalControllers = [PanelTrainingInternalController, FeedbackInternalController];
const employerControllers = [];
const modules = [];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...internalControllers, ...employerControllers],
})
export class SupportModule {}
