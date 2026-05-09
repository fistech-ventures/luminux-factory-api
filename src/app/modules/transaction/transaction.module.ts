import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from '@src/app/helpers/helpers.module';
import { CommonModule } from '../common/common.module';
import { PaymentGatewayModule } from '../payment-gateway/paymentGateway.module';
import { UserModule } from '../user/user.module';
import { TransactionSourceInternalController } from './controllers/internal/transactionSource.internal.controller';
import { UserInvoiceInternalController } from './controllers/internal/userInvoice.internal.controller';
import { UserTransactionInternalController } from './controllers/internal/userTransaction.internal.controller';
import { UserInvoiceWebController } from './controllers/web/userInvoice.web.controller';
import { UserTransactionWebController } from './controllers/web/userTransaction.web.controller';
import { OrgTransaction } from './entities/orgTransaction.entity';
import { TransactionSource } from './entities/transactionSource.entity';
import { UserInvoice } from './entities/userInvoice.entity';
import { UserTransaction } from './entities/userTransaction.entity';
import { OrgTransactionService } from './services/orgTransaction.service';
import { TransactionSourceService } from './services/transactionSource.service';
import { UserInvoiceService } from './services/userInvoice.service';
import { UserTransactionService } from './services/userTransaction.service';
import { UserTransactionSubscriber } from './subscribers/userTransaction.subscriber';

const entities = [UserTransaction, UserInvoice, TransactionSource, OrgTransaction];

const services = [UserTransactionService, UserInvoiceService, TransactionSourceService, OrgTransactionService];
const subscribers = [UserTransactionSubscriber];

const webControllers = [UserInvoiceWebController, UserTransactionWebController];
const internalControllers = [UserTransactionInternalController, UserInvoiceInternalController, TransactionSourceInternalController];

const modules = [UserModule, CommonModule, HttpModule, HelpersModule, PaymentGatewayModule];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class TransactionModule { }
