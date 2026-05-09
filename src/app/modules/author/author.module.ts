import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorInternalController } from './controllers/internal/author.internal.controller';
import { AuthorWebController } from './controllers/web/author.web.controller';
import { Author } from './entities/author.entity';
import { AuthorService } from './services/author.service';

const entities = [Author];
const services = [AuthorService];
const subscribers = [];
const webControllers = [AuthorWebController];
const internalControllers = [AuthorInternalController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class AuthorModule { }
