import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { HtmlHelper } from '@src/app/helpers';
import dtoToModelMapper from '@src/app/helpers/dtoToModelMapper';
import { PdfGeneratorHelper } from '@src/app/helpers/pdfGenerator.helper';
import { SupabaseUploadHelper } from '@src/app/helpers/supabaseUpload.helper';
import { IAuthUser, IFindBaseOptions } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { calculateDiscount, formatDateTimeYMD, generateNote, generateQrcode } from '@src/shared';
import { ENUM_PAYMENT_STATUS } from '@src/shared/enums/common.enums';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Area } from '../../common/entities/area.entity';
import { AreaService } from '../../common/services/area.service';
import { SmsService } from '../../notification/services/sms.service';
import { PaymentAccount } from '../../payment-gateway/entities/paymentAccount.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';
import { ProductService } from '../../product/services/product.service';
import { ProductVariantOptionService } from '../../product/services/productVariantOption.service';
import { OrgTransaction } from '../../transaction/entities/orgTransaction.entity';
import { UserInvoice } from '../../transaction/entities/userInvoice.entity';
import { OrgTransactionService } from '../../transaction/services/orgTransaction.service';
import { UserInvoiceService } from '../../transaction/services/userInvoice.service';
import { ENUM_USER_MEMBERSHIP_STATUS } from '../../user/const';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { UserAddressService } from '../../user/services/userAddress.service';
import { AuthService } from '../../auth/services/auth.service';
import { ENUM_INTERNAL_ORDER_STATUS, ENUM_ORDER_PAYMENT_STATUS } from '../const';
import { OrderCreateDTO, OrderMakePaymentDTO, OrderQuickCreateDTO } from '../dtos/order/create.dto';
import { OrderFilterDTO } from '../dtos/order/filter.dto';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/orderItem.entity';
import { OrderItemService } from './orderItem.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly _repo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly productVariantOptionService: ProductVariantOptionService,
    private readonly userService: UserService,
    // private readonly deliveryChargeService: DeliveryChargeService,
    private readonly areaService: AreaService,
    private readonly authService: AuthService,
    private readonly userAddressService: UserAddressService,
    private readonly userInvoiceService: UserInvoiceService,
    private readonly orgTransactionService: OrgTransactionService,
    private readonly smsService: SmsService,
    private readonly pdfGeneratorHelper: PdfGeneratorHelper,
    private readonly supabaseUploadHelper: SupabaseUploadHelper,
    private readonly htmlHelper: HtmlHelper,
    // private readonly orderStatusService: OrderStatusService,
  ) {
    super(_repo);
  }

  async createOrder(body: OrderCreateDTO, authUser: IAuthUser): Promise<Order> {
    const { discountType = null, customerId = authUser.id, addressId = null, discountAmount = 0, ...restPayload } = body;
    let { deliveryCharge = null } = restPayload;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customerData = await this.userService.findByIdBase(customerId,
        { relations: { activeCart: { items: true }, membership: true } });
      if (!customerData)
        throw new NotFoundException('Customer data not found!');
      if (!customerData?.activeCart?.items?.length)
        throw new BadRequestException('User cart is empty!')

      const products: Product[] = [];
      const productVariants: ProductVariantOption[] = [];

      let totalItem = 0;
      let subTotal = 0;
      let pDiscountAmount = 0;
      const discounts = [];

      // Load products and calculate totals
      for (const item of customerData?.activeCart?.items) {
        let variant = null;
        let product = null;
        if (item?.productVariantOptionId) {
          variant = await this.productVariantOptionService.isExist({ id: item.productVariantOptionId }, { relations: { product: true, variant: true, variantOption: true } });
          if (!variant) {
            throw new NotFoundException(`Variant option with ID ${item.productVariantOptionId} not found.`);
          }
          const variantDiscountAmount = calculateDiscount(
            {
              discountType: variant.product.discountType,
              amount: variant.product.discountAmount + variant.additionalDiscount
            },
            (variant.product.mrp + variant.additionalMRP),
            'discountAmount'
          );

          item.productId = variant.productId; // Set productId from variant option
          // item['product'] = variant.product; // Set product from variant option
          // delete variant.product
          productVariants.push(variant);
          pDiscountAmount += variantDiscountAmount * item.quantity;
          subTotal += (variant.product.mrp + variant.additionalMRP) * item.quantity;
          // subTotal += ((variant.product['mrp'] + variant['additionalMRP']) - (variantDiscountAmount)) * item.quantity;
        } else {
          product = await this.productService.isExist({ id: item.productId }, {
            relations: {
              author: true,
              translator: true,
              publication: true,
            }
          });

          const productDiscountAmount = calculateDiscount(
            {
              discountType: product.discountType,
              amount: product.discountAmount
            },
            product.mrp
          );
          products.push(product);
          pDiscountAmount += productDiscountAmount * item.quantity;
          subTotal += product.mrp * item.quantity;
        }
        totalItem += item.quantity;
      }

      if (pDiscountAmount > 0)
        discounts.push('Product')

      const totalProduct = products.length + productVariants.length;

      const addressData = await this.userAddressService.findOne({
        where: { id: addressId, userId: customerData.id }, relations: {
          area: { deliveryCharge: true }
        }
      });
      if (!addressData) throw new NotFoundException('Invalid address!');
      let isFreeDelivery = false;
      if (customerData?.membership && customerData?.membership?.status === ENUM_USER_MEMBERSHIP_STATUS.ACTIVE) {
        isFreeDelivery = true;
      } else if (deliveryCharge == null) {
        products.some(p => { if (p.isFreeDelivery) isFreeDelivery = true; return p.isFreeDelivery; })
      }

      // console.log("🚀 ~ OrderService ~ createOrder ~ discountAmount:", discountAmount)

      deliveryCharge = deliveryCharge ? deliveryCharge : isFreeDelivery ? 0 : addressData?.area?.deliveryCharge?.charge ?? 0; // You can define logic based on zone
      const deliveryZone = addressData?.area?.deliveryCharge?.deliveryZone;

      let total = Math.round(subTotal - pDiscountAmount);

      const orderDiscountAmount = calculateDiscount(
        {
          discountType: discountType,
          amount: discountAmount
        },
        total
      );

      if (orderDiscountAmount > 0) {
        discounts.push('Order')
      }

      total = total - orderDiscountAmount + deliveryCharge;
      const grandTotal = total;
      const dueAmount = grandTotal;

      const order = this._repo.create({
        code: 'ORD' + Date.now(), // Unique code
        totalProduct,
        totalItem,
        subTotal,
        deliveryCharge,
        deliveryZone,
        discountAmount: orderDiscountAmount + pDiscountAmount,
        discountType: discounts.join(' + '),
        grandTotal,
        total,
        dueAmount,
        userId: customerData.id,
        userMembershipId: customerData?.membership?.status === ENUM_USER_MEMBERSHIP_STATUS.ACTIVE ? customerData.membershipId : null,
        address: {
          id: addressData.id,
          label: addressData.label,
          fullName: addressData.fullName,
          phoneNumber: addressData.phoneNumber,
          email: addressData.email,
          isThisWhatsAppNumber: addressData.isThisWhatsAppNumber,
          addressLine1: addressData.addressLine1,
          addressLine2: addressData.addressLine2,
          areaId: addressData.areaId,
          areaTitle: addressData.area.title,
          // cityId: addressData.area.cityId,
          // cityTitle: addressData.area.city.title,
          deliveryChargeId: addressData.area.deliveryChargeId,
          deliveryCharge: deliveryCharge,
          deliveryZone: addressData.area.deliveryCharge.deliveryZone,
        },
        panel: restPayload.panel,
        source: restPayload.source,
        customerInstruction: restPayload.customerInstruction,
        sendAsGift: restPayload.sendAsGift,
        pasteBoard: restPayload?.pasteBoard ?? await generateNote(),
        createdBy: authUser,
        salesPersonId: restPayload?.salesPersonId,
        salesPerson: restPayload?.salesPerson
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems: OrderItem[] = [];
      const productsToUpdateStock: Product[] = [];
      const variantsToUpdateStock: ProductVariantOption[] = [];

      for (let i = 0; i < products.length; i++) {
        const itemDto = customerData?.activeCart?.items[i];
        const product = products[i];
        // const productVariant = productVariants[i];
        // const productVariantId = productVariant ? productVariant.id : null;
        const orderItem = this.orderItemService.repo.create({
          orderId: savedOrder.id,
          productId: product.id,
          product,
          // productVariantId,
          // productVariant,
          quantity: itemDto.quantity,
        });
        orderItems.push(orderItem);
        productsToUpdateStock.push({
          id: product.id,
          stockQuantity: Math.max(0, product.stockQuantity - itemDto.quantity),
          saleQuantity: product.saleQuantity + itemDto.quantity
        });
      }
      for (let i = 0; i < productVariants.length; i++) {
        const itemDto = customerData?.activeCart?.items[i];
        const product = productVariants[i].product;
        const productVariant = productVariants[i];
        const productVariantId = productVariant ? productVariant.id : null;

        const orderItem = this.orderItemService.repo.create({
          orderId: savedOrder.id,
          productId: product.id,
          product,
          productVariantId,
          productVariant,
          quantity: itemDto.quantity,
        });
        orderItems.push(orderItem);
        variantsToUpdateStock.push({
          id: productVariant.id,
          stockQuantity: productVariant.stockQuantity - itemDto.quantity,
          saleQuantity: productVariant.saleQuantity + itemDto.quantity
        });
        productsToUpdateStock.push({
          id: product.id,
          stockQuantity: Math.max(0, product.stockQuantity - itemDto.quantity),
          saleQuantity: product.saleQuantity + itemDto.quantity
        });
      }
      await queryRunner.manager.save(OrderItem, orderItems);

      // customerInvoice
      const dueInvoice = await queryRunner.manager.findOne(UserInvoice, { where: { userId: customerData.id, isActive: true, paymentStatus: ENUM_PAYMENT_STATUS.UNPAID } });
      const dueInvoiceAmount = dueInvoice?.amount || 0;
      await queryRunner.manager.update(UserInvoice, { isActive: true, userId: customerData.id }, { isActive: false });
      const payableAmount = grandTotal + dueInvoiceAmount;

      const invoiceCode = await this.userInvoiceService.generateUniqueCode(queryRunner);

      const qrCode = await generateQrcode(invoiceCode);

      const payloadForHtmlContent: any = {
        qrCode: qrCode.toString('base64'),
        invoiceCode: invoiceCode,
        orderCode: order.code,
        date: formatDateTimeYMD(order.createdAt),
        paymentMethod: order.paymentMethod,
        customerName: customerData.fullName,
        customerPhone: customerData.phoneNumber,
        customerAddress: `${order.address.addressLine1}, ${order.address.areaTitle}`,
        customerInstruction: order.customerInstruction,
        subTotal,
        total,
        discountAmount,
        deliveryCharge,
        dueAmount: dueInvoiceAmount,
        payableAmount,
        paymentStatus: ENUM_PAYMENT_STATUS.UNPAID,
        products: orderItems
      };

      const htmlContent = await this.htmlHelper.createHtmlContent(
        { ...payloadForHtmlContent },
        ENV.systemConfig.orderInvoiceTemplate,
      );
      const pdf = await this.pdfGeneratorHelper.createPDF(htmlContent);

      const pdfLink = await this.supabaseUploadHelper.uploadBinary(
        ENV.systemConfig.orderInvoiceTemplate,
        pdf,
        `${invoiceCode}-${ENV.systemConfig.orderInvoiceTemplate}-${Date.now()}.pdf`,
        'application/pdf',
      );
      console.info("🚀 ~ OrderService ~ createOrder ~ pdfLink:", pdfLink)
      const customerInvoice = await queryRunner.manager.save(UserInvoice, {
        code: invoiceCode,
        amount: payableAmount,
        previousDue: dueInvoiceAmount,
        orderId: savedOrder.id,
        userId: customerData.id,
        pdfLink,
      } satisfies Partial<UserInvoice>);

      await queryRunner.manager.save(Order, {
        id: savedOrder.id,
        userInvoiceId: customerInvoice.id,
      } satisfies Partial<Order>);

      await queryRunner.manager.save(Cart, { id: customerData?.activeCartId, status: 'inactive' });
      await queryRunner.manager.save(User, { id: customerData.id, activeCartId: null });
      await queryRunner.commitTransaction();
      // this.smsService.sendSmsThroughDefaultGateway({
      //   recipient: savedOrder.address.phoneNumber, message: `Dear ${savedOrder.address.fullName},
      // Your Order has been Confirmed.
      // Thanks for choosing Fibonacci, Happy Reading!
      // Order No: ${savedOrder.code}
      // Total Amount: ${savedOrder.grandTotal}
      // To view your invoice click- ${ENV.externalUrls.webUrl}/user-invoice/${invoiceCode}`
      // })

      return this._repo.findOne({ where: { id: savedOrder.id }, relations: { items: true, userInvoice: true } });
    } catch (err) {
      console.error("🚀 ~ OrderService ~ createOrder ~ err:", err)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createQuickOrder(body: OrderQuickCreateDTO, authUser?: IAuthUser): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const products: Product[] = [];
      const productVariants: ProductVariantOption[] = [];

      let totalItem = 0;
      let subTotal = 0;
      let discountAmount = 0;
      let discountType = null;

      // Load products and calculate totals
      for (const item of body.products) {
        let variant = null;
        let product = null;
        if (!item?.variantOptionId && !item?.productId) throw new NotFoundException(`No product or variant is selected!`);

        if (item?.variantOptionId) {
          variant = await this.productVariantOptionService.isExist({ id: item.variantOptionId }, { relations: { product: true, variant: true, variantOption: true } });
          if (!variant) {
            throw new NotFoundException(`Variant option with ID ${item.variantOptionId} not found.`);
          }
          item.productId = variant.productId; // Set productId from variant option

          const variantDiscountAmount = await calculateDiscount(
            {
              discountType: variant.product.discountType,
              amount: variant.product['discountAmount'] + variant['additionalDiscount']
            },
            variant.product['mrp'] + variant['additionalMRP']
          );
          discountAmount += variantDiscountAmount * item.quantity;
          variant.product['saleAmount'] = (variant.product['mrp'] + variant['additionalMRP']) - (variantDiscountAmount);
          productVariants.push(variant);
          subTotal += (variant.product['mrp'] + variant['additionalMRP']) * item.quantity;
          // subTotal += ((variant.product['mrp'] + variant['additionalMRP']) - (variantDiscountAmount)) * item.quantity;
        } else {
          product = await this.productService.isExist({ id: item.productId }, {
            relations: {
              author: true,
              translator: true,
              publication: true,
            }
          });
          const productDiscountAmount = calculateDiscount(
            {
              discountType: product.discountType,
              amount: product.discountAmount
            },
            product.mrp
          );
          discountAmount += productDiscountAmount * item.quantity;
          product['saleAmount'] = product.mrp - productDiscountAmount;
          products.push(product);
          subTotal += product.mrp * item.quantity;
          // subTotal += (product['mrp'] - productDiscountAmount) * item.quantity;
        }
        totalItem += item.quantity;
      }

      let total = Math.round(subTotal - discountAmount);
      const totalProduct = products.length;
      let isFreeDelivery = false;
      products.some(p => { if (p.isFreeDelivery) isFreeDelivery = true; return p.isFreeDelivery; })

      let userData: User;
      
      // Handle quick registration if requested
      if (body.createAccount && body.customerEmail) {
        const quickRegResult = await this.authService.quickRegisterUser({
          fullName: body.customerName,
          phoneNumber: body.customerPhoneNumber,
          email: body.customerEmail,
          source: body.source || 'web'
        }, authUser);
        userData = quickRegResult.user;
      } else {
        userData = await this.userService.findOrCreateByPhoneNumber(body.customerPhoneNumber, body.customerName, authUser);
      }
      const areaData = await this.areaService.findOne({ where: { id: body.areaId }, relations: { deliveryCharge: true } })
      const deliveryChargeData = areaData.deliveryCharge;
      // const deliveryChargeData = await this.deliveryChargeService.findOne({ where: { deliveryZone: body.deliveryZone } })

      const deliveryCharge = isFreeDelivery ? 0 : deliveryChargeData?.charge ?? 0 // You can define logic based on zone
      if (discountAmount > 0) {
        discountAmount = Math.round(discountAmount)
        discountType = 'direct'
      }
      total = Math.round(total + deliveryCharge);
      const grandTotal = total;
      const dueAmount = grandTotal;

      const quickOrderPayload = {
        code: 'QORD' + Date.now(), // Unique code
        totalProduct,
        deliveryZone: deliveryChargeData.deliveryZone,
        totalItem,
        subTotal,
        deliveryCharge,
        discountAmount,
        discountType,
        grandTotal,
        total,
        dueAmount,
        userId: userData.id,
        addressId: null,
        address: {
          id: null,
          label: null,
          fullName: body.customerName,
          phoneNumber: body.customerPhoneNumber,
          email: null,
          isThisWhatsAppNumber: false,
          addressLine1: body.addressLine,
          addressLine2: null,
          areaId: areaData.id,
          areaTitle: areaData.title,
          // cityId: null,
          // cityTitle: null,
          deliveryChargeId: deliveryChargeData.id,
          deliveryCharge: deliveryCharge,
          deliveryZone: deliveryChargeData.deliveryZone,
        },
        source: body.source,
        panel: body.panel,
        paymentMethod: body.paymentMethod,
        customerInstruction: body.customerInstruction,
        sendAsGift: body.sendAsGift,
        pasteBoard: body?.pasteBoard ?? await generateNote(),
        createdBy: authUser ? authUser : userData
      }
      const order = this._repo.create(quickOrderPayload);

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems: OrderItem[] = [];
      const productsToUpdateStock: Product[] = [];
      const variantsToUpdateStock: ProductVariantOption[] = [];
      for (let i = 0; i < products.length; i++) {
        const itemDto = body.products[i];
        const product = products[i];
        // const productVariant = productVariants[i];
        // const productVariantId = productVariant ? productVariant.id : null;

        const orderItem = this.orderItemService.repo.create({
          orderId: savedOrder.id,
          productId: product.id,
          product,
          quantity: itemDto.quantity,
        });
        orderItems.push(orderItem);
        productsToUpdateStock.push({
          id: product.id,
          stockQuantity: Math.max(0, product.stockQuantity - itemDto.quantity),
          saleQuantity: product.saleQuantity + itemDto.quantity
        });
      }
      if (productVariants?.length) {
        for (let i = 0; i < productVariants.length; i++) {
          const itemDto = body?.products[i];
          const product = productVariants[i].product;
          const productVariant = productVariants[i];
          const productVariantId = productVariant ? productVariant.id : null;
          const orderItem = this.orderItemService.repo.create({
            orderId: savedOrder.id,
            productId: product.id,
            product,
            productVariantId,
            productVariant,
            quantity: itemDto.quantity,
          });
          orderItems.push(orderItem);
          variantsToUpdateStock.push({
            id: productVariant.id,
            stockQuantity: productVariant.stockQuantity - itemDto.quantity,
            saleQuantity: productVariant.saleQuantity + itemDto.quantity
          });
          productsToUpdateStock.push({
            id: product.id,
            stockQuantity: Math.max(0, product.stockQuantity - itemDto.quantity),
            saleQuantity: product.saleQuantity + itemDto.quantity
          });
        }
      }
      await queryRunner.manager.save(OrderItem, orderItems);

      // customerInvoice
      const dueInvoice = await queryRunner.manager.findOne(UserInvoice, { where: { userId: userData.id, isActive: true, paymentStatus: ENUM_PAYMENT_STATUS.UNPAID } });
      const dueInvoiceAmount = dueInvoice?.amount || 0;

      await queryRunner.manager.update(UserInvoice, { isActive: true, userId: userData.id }, { isActive: false });
      const payableAmount = grandTotal + dueInvoiceAmount;

      const invoiceCode = await this.userInvoiceService.generateUniqueCode(queryRunner);
      const qrCode = await generateQrcode(invoiceCode);

      const payloadForHtmlContent: any = {
        qrCode: qrCode.toString('base64'),
        invoiceCode: invoiceCode,
        orderCode: order.code,
        date: formatDateTimeYMD(order.createdAt),
        paymentMethod: order.paymentMethod,
        customerName: body.customerName,
        customerPhone: body.customerPhoneNumber,
        customerAddress: `${order.address.addressLine1}, ${order.address.areaTitle}`,
        customerInstruction: order.customerInstruction,
        subTotal,
        total,
        discountAmount,
        deliveryCharge,
        dueAmount: dueInvoiceAmount,
        payableAmount,
        paymentStatus: ENUM_PAYMENT_STATUS.UNPAID,
        products: orderItems
      };

      const htmlContent = await this.htmlHelper.createHtmlContent(
        { ...payloadForHtmlContent },
        ENV.systemConfig.orderInvoiceTemplate,
      );
      const pdf = await this.pdfGeneratorHelper.createPDF(htmlContent);

      const pdfLink = await this.supabaseUploadHelper.uploadBinary(
        ENV.systemConfig.orderInvoiceTemplate,
        pdf,
        `${invoiceCode}-${ENV.systemConfig.orderInvoiceTemplate}-${Date.now()}.pdf`,
        'application/pdf',
      );

      const customerInvoice = await queryRunner.manager.save(UserInvoice, {
        code: invoiceCode,
        amount: grandTotal + dueInvoiceAmount,
        previousDue: dueInvoiceAmount,
        orderId: savedOrder.id,
        userId: userData.id,
        pdfLink
      } satisfies Partial<UserInvoice>);
      await queryRunner.manager.save(Order, {
        id: savedOrder.id,
        userInvoiceId: customerInvoice.id,
      } satisfies Partial<Order>);

      await queryRunner.commitTransaction();
      // this.smsService.sendSmsThroughDefaultGateway({
      //   recipient: savedOrder.address.phoneNumber,
      //   message: `Dear ${savedOrder.address.fullName},
      // Your Order has been Confirmed.
      // Thanks for choosing Fibonacci, Happy Reading!
      // Order No: ${savedOrder.code}
      // Total Amount: ${savedOrder.grandTotal}
      // To view your invoice click- ${ENV.externalUrls.webUrl}/user-invoice/${invoiceCode}`
      // })
      return this._repo.findOne({ where: { id: savedOrder.id }, relations: { items: true, userInvoice: true } });
    } catch (err) {
      console.error("🚀 ~ OrderService ~ createQuickOrder ~ err:", err)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrder(
    id: string,
    body: {
      address?: any;
      deliveryCharge?: number;
      discountType?: 'flat' | 'percentage';
      discountAmount?: number;
      status?: string;
      addProducts?: { productId: string; variantOptionId: string; quantity: number; }[];
      removeProductIds?: string[];
    },
    authUser: any
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: { items: true, statuses: true },
      });

      if (!order) throw new NotFoundException('Order not found');

      /** ============================
       *  ADDRESS UPDATE + DELIVERY CHARGE FROM AREA
       * ============================ */
      if (body.address) {
        order.address = body.address;
        if (body.address.areaId) {
          const area = await queryRunner.manager.findOne(Area, {
            where: { id: body.address.areaId },
          });
          if (area?.deliveryCharge != null) {
            order.deliveryCharge = area.deliveryCharge.charge;
          }
        }
      }

      /** ============================
       *  DIRECT DELIVERY CHARGE UPDATE
       * ============================ */
      if (typeof body.deliveryCharge === 'number') {
        order.deliveryCharge = body.deliveryCharge;
      }

      /** ============================
       *  DISCOUNT UPDATE
       * ============================ */
      if (body.discountType) {
        order.discountType = body.discountType;
      }
      if (typeof body.discountAmount === 'number') {
        order.discountAmount = body.discountAmount;
      }


      // const productsToUpdateStock: Product[] = [];
      // const variantsToUpdateStock: ProductVariantOption[] = [];

      /** ============================
       *  ADD PRODUCTS
       * ============================ */
      if (body.addProducts?.length) {
        for (const p of body.addProducts) {
          if (p.productId) {
            const existingProductItem = order.items.find(i => i.productId === p.productId);
            if (existingProductItem) {
              existingProductItem.quantity += p.quantity;
              order.items.push(existingProductItem);
              await queryRunner.manager.decrement(Product, { id: p.productId }, 'stockQuantity', p.quantity)
              await queryRunner.manager.increment(Product, { id: p.productId }, 'saleQuantity', p.quantity)
            } else {
              const productData = await this.productService.findByIdBase(p.productId)
              const newItem = queryRunner.manager.create(OrderItem, {
                orderId: id,
                productId: p.productId,
                product: productData,
                quantity: p.quantity,
              });
              order.items.push(newItem);
              await queryRunner.manager.decrement(Product, { id: p.productId }, 'stockQuantity', p.quantity)
              await queryRunner.manager.increment(Product, { id: p.productId }, 'saleQuantity', p.quantity)
            }
          } else if (p.variantOptionId) {
            const existingProductVariantItem = order.items.find(i => i.productVariantId === p.variantOptionId);
            if (existingProductVariantItem) {
              existingProductVariantItem.quantity += p.quantity;
              order.items.push(existingProductVariantItem);
              await queryRunner.manager.decrement(ProductVariantOption, { id: p.variantOptionId }, 'stockQuantity', p.quantity)
              await queryRunner.manager.increment(ProductVariantOption, { id: p.variantOptionId }, 'saleQuantity', p.quantity)
            } else {
              const productVariantOptionData = await this.productVariantOptionService.findByIdBase(p.variantOptionId)
              const newItem = queryRunner.manager.create(OrderItem, {
                orderId: id,
                productVariantId: p.variantOptionId,
                productVariant: productVariantOptionData,
                quantity: p.quantity,
              });
              order.items.push(newItem);
              await queryRunner.manager.decrement(ProductVariantOption, { id: p.variantOptionId }, 'stockQuantity', p.quantity)
              await queryRunner.manager.increment(ProductVariantOption, { id: p.variantOptionId }, 'saleQuantity', p.quantity)

            }
          }
        }
      }

      /** ============================
       *  REMOVE PRODUCTS
       * ============================ */
      if (body.removeProductIds?.length) {
        order.items = order.items.filter(
          i => !body.removeProductIds.includes(i.productId),
        );
        await queryRunner.manager.delete(OrderItem, {
          orderId: id,
          productId: In(body.removeProductIds),
        });
      }

      /** ============================
       *  STATUS UPDATE + HISTORY
       * ============================ */
      if (body.status && body.status !== order.status) {
        throw new BadRequestException(`Hi ${authUser.name}, Contact tech team to update order status!`)
        // order.status = body.status;
        // const statusHistory = queryRunner.manager.create(OrderStatus, {
        //   orderId: id,
        //   status: body.status,
        //   changedBy: authUser.id,
        //   changedAt: new Date(),
        // });
        // await queryRunner.manager.save(statusHistory);
        // this.orderStatusService.addStatus(id, body.operationalStatus, body.note, authUser.id, { force: body.force });
      }

      /** ============================
       *  TOTAL RECALCULATION
       * ============================ */
      let subtotal = 0;
      order.items.forEach(item => {
        if (item.productVariant) {
          subtotal += item.productVariant.saleAmount * item.quantity;
        } else {
          subtotal += item.product.saleAmount * item.quantity;
        }
      });
      let discountValue = 0;
      if (order.discountType === 'percentage') {
        discountValue = (subtotal * (order.discountAmount ?? 0)) / 100;
      } else {
        discountValue = order.discountAmount ?? 0;
      }

      order.grandTotal = subtotal + (order.deliveryCharge ?? 0) - discountValue;
      order.totalProduct = order.items.length;
      order.totalItem = order.items.reduce(
        (sum, item) => sum + item.quantity, 0
      );
      /** ============================
       *  SAVE ORDER
       * ============================ */
      await queryRunner.manager.save(OrderItem, order.items);
      await queryRunner.manager.save(dtoToModelMapper(this.dataSource, Order, order));

      await queryRunner.commitTransaction();
      return this.findByIdBase(id, { relations: { items: true } });
    } catch (error) {
      console.error("🚀 ~ OrderService ~ updateOrder ~ error:", error)
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async makePayment(
    orderId: string,
    body: OrderMakePaymentDTO,
    authUser: IAuthUser
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // ✅ Validate payment amount
      if (body.amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero');
      }

      if (body.amount > order.dueAmount) {
        throw new BadRequestException(`Payment exceeds due amount (${order.dueAmount})`);
      }
      const paymentAccount = await queryRunner.manager.findOne(PaymentAccount, {
        where: { id: body.paymentAccountId },
        relations: { gateway: true },
      });
      const currentInvoice = await queryRunner.manager.findOne(UserInvoice, { where: { userId: order.userId, isActive: true } });

      // ✅ Create Payment record
      const orgTransaction = queryRunner.manager.create(OrgTransaction, {
        code: await this.orgTransactionService.generateUniqueCode(queryRunner),
        cause: 'Product Order Payment',
        amount: body.amount,
        invoiceCode: currentInvoice.code,
        orderCode: order.code,
        paymentGateway: paymentAccount.gateway.title ?? null,
        paymentAccount: paymentAccount.title ?? null,
        txnCode: body.txnCode,
        txnSource: body.txnSource,
        paymentNote: body.paymentNote,
        paidAt: new Date(),
        createdBy: authUser,
        transactionById: authUser.id,
      });
      await queryRunner.manager.save(orgTransaction);
      paymentAccount.currentBalance = (paymentAccount.currentBalance ?? 0) + body.amount;
      await queryRunner.manager.save(paymentAccount);

      // ✅ Update order paid amount & status
      order.paidAmount = (order.paidAmount ?? 0) + body.amount;
      order.dueAmount = (order.dueAmount ?? 0) - body.amount;

      if (order.paidAmount >= order.grandTotal) {
        order.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PAID;
      } else if (order.paidAmount > 0) {
        order.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PARTIALLY_PAID;
      }

      if (order.dueAmount <= 0) {
        order.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PAID;
      } else if (order.dueAmount > 0 && (order.paidAmount >= 0 && order.paidAmount === order.deliveryCharge)) {
        order.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.DELIVERY_CHARGE_PAID;
      } else if (order.dueAmount > 0 && order.paidAmount > 0) {
        order.paymentStatus = ENUM_ORDER_PAYMENT_STATUS.PARTIALLY_PAID;
      }

      // Optional: Update order status automatically if fully paid
      if (order.paymentStatus !== ENUM_ORDER_PAYMENT_STATUS.UNPAID && order.status === ENUM_INTERNAL_ORDER_STATUS.PENDING) {
        order.status = ENUM_INTERNAL_ORDER_STATUS.CONFIRMED;
      }

      order = await queryRunner.manager.save(order);
      if (currentInvoice.amount === body.amount) {
        currentInvoice.paymentStatus = ENUM_PAYMENT_STATUS.PAID;
        currentInvoice.paidAt = new Date();
        currentInvoice.isActive = false;
      } else if (currentInvoice.amount > 0 && currentInvoice.amount < body.amount) {
        currentInvoice.paymentStatus = ENUM_PAYMENT_STATUS.PARTIALLY_PAID;
        await queryRunner.manager.save(UserInvoice, {
          code: await this.userInvoiceService.generateUniqueCode(queryRunner),
          billedAmount: 0,
          amount: currentInvoice.amount - body.amount,
          previousDue: currentInvoice.amount - body.amount,
          userId: currentInvoice.userId,
        });
      }
      await queryRunner.manager.save(currentInvoice);

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllWithStats(
    query: OrderFilterDTO,
    options?: IFindBaseOptions<Order>,
  ): Promise<SuccessResponse<Order[]>> {
    const [orderData, stats] = await Promise.all([
      this.findAllBase(query, options),
      this.getStatusStats(query),
    ]);
    orderData['stats'] = stats;
    return orderData
  }

  async getStatusStats(
    query: OrderFilterDTO,
  ): Promise<Record<ENUM_INTERNAL_ORDER_STATUS, number>> {

    const qb = this.repo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      // .addSelect('order.createdAt', 'createdAt')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status');
    // .addGroupBy('order.createdAt');

    this.applyOrderFilters(qb, query);

    const raw = await qb.getRawMany();

    // 🧱 initialize all statuses with 0
    const stats = Object.values(ENUM_INTERNAL_ORDER_STATUS).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<ENUM_INTERNAL_ORDER_STATUS, number>,
    );

    // 🔁 apply actual counts
    for (const row of raw) {
      stats[row.status] = Number(row.count);
    }

    return stats;
  }

  async generateInvoiceByOrder(order: Order, authUser: IAuthUser): Promise<any> {

    const currentInvoiceData = await this.userInvoiceService.findOne({ where: { id: order.userInvoiceId } })
    const dueInvoiceAmount = currentInvoiceData?.previousDue || 0;
    const payableAmount = order.grandTotal + dueInvoiceAmount;

    const invoiceCode = currentInvoiceData.code;

    const qrCode = await generateQrcode(invoiceCode);

    const payloadForHtmlContent: any = {
      qrCode: qrCode.toString('base64'),
      invoiceCode: invoiceCode,
      orderCode: order.code,
      date: formatDateTimeYMD(order.createdAt),
      paymentMethod: order.paymentMethod,
      customerName: order.address.fullName,
      customerPhone: order.address.phoneNumber,
      customerAddress: `${order.address.addressLine1}, ${order.address.areaTitle}`,
      customerInstruction: order.customerInstruction,
      subTotal: order.subTotal,
      total: order.total,
      discountAmount: order.discountAmount,
      deliveryCharge: order.deliveryCharge,
      dueAmount: dueInvoiceAmount,
      payableAmount: payableAmount,
      paymentStatus: ENUM_PAYMENT_STATUS.UNPAID,
      products: order.items
    };

    const htmlContent = await this.htmlHelper.createHtmlContent(
      { ...payloadForHtmlContent },
      ENV.systemConfig.orderInvoiceTemplate,
    );
    const pdf = await this.pdfGeneratorHelper.createPDF(htmlContent);

    const pdfLink = await this.supabaseUploadHelper.uploadBinary(
      ENV.systemConfig.orderInvoiceTemplate,
      pdf,
      `${invoiceCode}-${ENV.systemConfig.orderInvoiceTemplate}-${Date.now()}.pdf`,
      'application/pdf',
    );
    console.info("🚀 ~ OrderService ~ createOrder ~ pdfLink:", pdfLink)
    return this.userInvoiceService.updateOneBase(currentInvoiceData.id, {
      pdfLink,
      updatedBy: authUser
    } satisfies Partial<UserInvoice>);
  }

  private applyOrderFilters(
    qb: SelectQueryBuilder<Order>,
    query: OrderFilterDTO,
  ): SelectQueryBuilder<Order> {

    if (query.paymentStatus) {
      qb.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: query.paymentStatus,
      });
    }

    if (query.source) {
      qb.andWhere('order.source = :source', {
        source: query.source,
      });
    }

    if (query.userId) {
      qb.andWhere('order.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.deliveryZone) {
      qb.andWhere('order.deliveryZone = :deliveryZone', {
        deliveryZone: query.deliveryZone,
      });
    }

    if (query?.startDate && query?.endDate) {
      qb.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
      // query['createdAt'] = Between(query?.startDate, query?.endDate);
    }
    delete query?.startDate;
    delete query?.endDate;
    // 🔗 Join user only if needed
    if (query.searchTerm) {
      qb.leftJoin('order.user', 'user');
      qb.leftJoin('order.userMembership', 'userMembership');

      qb.andWhere(
        `(order.code ILIKE :search OR user.phoneNumber ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search OR userMembership.code ILIKE :search)`,
        { search: `%${query.searchTerm}%` },
      );
    }
    return qb;
  }
}
