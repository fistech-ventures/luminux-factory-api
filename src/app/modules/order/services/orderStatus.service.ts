import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, Repository } from 'typeorm';
import { ENUM_CUSTOMER_ORDER_STATUS, ENUM_INTERNAL_ORDER_STATUS, ORDER_FLOW } from '../const';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { OrderService } from './order.service';
// import { ProviderServiceRequest } from '../../logistic/entities/providerServiceRequest.entity';
import { ServiceProviderService } from '../../logistic/services/serviceProvider.service';
import { IAuthUser } from '@src/app/interfaces';

@Injectable()
export class OrderStatusService extends BaseService<OrderStatus> {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly _repo: Repository<OrderStatus>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly serviceProviderService: ServiceProviderService,
  ) {
    super(_repo);
  }

  canTransition(
    current: ENUM_INTERNAL_ORDER_STATUS,
    next: ENUM_INTERNAL_ORDER_STATUS,
    opts?: { force?: boolean; allowBackward?: boolean }
  ): boolean {
    if (opts?.force) return true;

    // forward allowed?
    if (ORDER_FLOW[current]?.includes(next)) return true;

    // backward allowed?
    if (opts?.allowBackward) {
      const backwardsAllowed = ORDER_FLOW[next]?.includes(current);
      if (backwardsAllowed) return true;
    }

    return false;
  }

  async addStatus(
    orderId: string,
    newOperationalStatus: ENUM_INTERNAL_ORDER_STATUS,
    authUser: IAuthUser,
    note?: string,
    serviceProviderId?: string,
    options?: { force?: boolean; allowBackward?: boolean; customerLabel?: string }
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ Step 1: Lock only the order row (no relations here)
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) throw new NotFoundException('Order not found');

      // ✅ Step 2: Perform validation
      const current = order.status as ENUM_INTERNAL_ORDER_STATUS;
      if (
        !this.canTransition(current, newOperationalStatus, {
          force: options?.force,
          allowBackward: options?.allowBackward,
        })
      ) {
        throw new BadRequestException(
          `Cannot transition from ${current} to ${newOperationalStatus}`,
        );
      }

      // ✅ Step 3: Create or update existing status entry
      let statusRow = await queryRunner.manager.findOne(OrderStatus, {
        where: { orderId, operationalStatus: newOperationalStatus },
      });

      if (statusRow) {
        // 🔁 Update existing status
        statusRow.note = note ?? statusRow.note;
        statusRow.status = options?.customerLabel ?? ENUM_CUSTOMER_ORDER_STATUS[newOperationalStatus];
        statusRow.changedById = authUser?.id ?? statusRow.changedById;
        statusRow.updatedAt = new Date();
        statusRow.updatedBy = authUser;
      } else {
        // 🆕 Create new status
        statusRow = queryRunner.manager.create(OrderStatus, {
          orderId,
          operationalStatus: newOperationalStatus,
          status: options?.customerLabel ?? ENUM_CUSTOMER_ORDER_STATUS[newOperationalStatus],
          note,
          changedById: authUser.id ?? null,
          createdBy: authUser
        });
      }

      // ✅ Save (handles both create & update)
      await queryRunner.manager.save(OrderStatus, statusRow);

      // ✅ Step 4: Update order’s current status
      order.status = newOperationalStatus;
      if (serviceProviderId) {
        await this.serviceProviderService.createRequest(serviceProviderId, order, authUser, queryRunner)
        // const serviceProvider = await this.serviceProviderService.isExist({ id: serviceProviderId })
        // await queryRunner.manager.save(ProviderServiceRequest, {
        //   status: 'Ready To Ship',
        //   providerTrackingCode: null,
        //   orderCode: order.code,
        //   serviceType: serviceProvider.type,
        //   orderId,
        //   serviceProviderId,
        //   changeTrack: [{
        //     time: new Date(),
        //     status: 'Ready To Ship',
        //     note: 'Order is ready to ship'
        //   }],
        //   createdBy: authUser
        // })
        order.deliveryPartnerId = serviceProviderId ? serviceProviderId : order.deliveryPartnerId;

      }
      await queryRunner.manager.save(Order, order);

      // ✅ Commit
      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTrackingByOrderId(orderId: string): Promise<any> {
    const orderData = await this.orderService.repo.findOneOrFail({
      where: { id: orderId },
      select: { id: true, createdAt: true, code: true }
    })
    return this.getTracking(orderData.code)
  }

  async getTracking(orderCode: string): Promise<any> {
    const order = await this.orderService.findOne({
      where: { code: orderCode },
      relations: { 'items': true, 'statuses': true, 'user': true },
      order: { createdAt: 'DESC' },
    });
    if (!order) throw new NotFoundException('Order not found');

    const statuses = (order.statuses ?? []).sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
    );

    const timeline = statuses.map(s => ({
      operationalStatus: s.operationalStatus,
      label: s.status,
      note: s.note,
      changedAt: s.createdAt,
      changedBy: s.changedBy,
    }));

    const current = order.status as ENUM_INTERNAL_ORDER_STATUS;
    const previous = timeline.filter(t => t.operationalStatus !== current);

    // ✅ Next steps (forward OR rollback candidates)
    const next = [
      ...(ORDER_FLOW[current] ?? []),
      ...Object.keys(ORDER_FLOW).filter(k => ORDER_FLOW[k as any]?.includes(current)) // backwards options
    ];

    // Steps for frontend progress bar
    const steps = Object.values(ENUM_INTERNAL_ORDER_STATUS).map(st => ({
      id: st,
      label: ENUM_CUSTOMER_ORDER_STATUS[st],
      completed: statuses.some(s => s.operationalStatus === st), // once done, always completed
      active: st === current,
    }));

    const progress = this.getProgress(steps);

    return {
      order: {
        id: order.id,
        code: order.code,
        address: order.address,
        totals: {
          subTotal: order.subTotal,
          deliveryCharge: order.deliveryCharge,
          grandTotal: order.grandTotal,
        },
      },
      items: (order.items || []).map(i => ({
        id: i.id,
        product: i.product,
        quantity: i.quantity,
      })),
      timeline,
      current,
      previous,
      next: Array.from(new Set(next)), // deduplicate
      steps,
      progress,
    };
  }

  private getProgress(steps: Array<{ completed: boolean; active: boolean }>): any {
    const total = steps.length;
    const completedCount = steps.filter(s => s.completed).length;
    const currentIndex = steps.findIndex(s => s.active);
    const percent = Math.round((completedCount / total) * 100);
    return { total, completedCount, currentIndex, percent };
  }
}
