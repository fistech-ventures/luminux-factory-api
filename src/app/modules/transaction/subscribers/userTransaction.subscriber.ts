import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { UserTransaction } from '../entities/userTransaction.entity';
import { ENUM_TRANSACTION_STATUS } from '../enums';

@EventSubscriber()
export class UserTransactionSubscriber implements EntitySubscriberInterface<UserTransaction> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof UserTransaction {
    return UserTransaction;
  }

  async beforeInsert(event: InsertEvent<UserTransaction>): Promise<void> {
    // UserTransaction is not approved by default when created
    if (event.entity.status === ENUM_TRANSACTION_STATUS.APPROVED) {
      event.entity.status = ENUM_TRANSACTION_STATUS.PENDING;
    }
    event.entity.transactionTime = event.entity.transactionTime ?? new Date();
  }

  async beforeUpdate(event: InsertEvent<Partial<UserTransaction>>): Promise<void> {
    if (event.entity.status === ENUM_TRANSACTION_STATUS.APPROVED) {
      event.entity.status = ENUM_TRANSACTION_STATUS.APPROVED;
      event.entity.settledAt = event.entity.settledAt ? event.entity.settledAt : new Date();
    }
  }
}
