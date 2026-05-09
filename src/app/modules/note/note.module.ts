import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteInternalController } from './controllers/internal/note.internal.controller';
import { Note } from './entities/note.entity';
import { NoteService } from './services/note.service';

const entities = [Note];
const services = [NoteService];
const subscribers = [];
const webControllers = [];
const internalControllers = [NoteInternalController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class NoteModule { }
