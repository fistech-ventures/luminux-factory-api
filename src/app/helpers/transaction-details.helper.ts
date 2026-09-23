import { In, Repository } from 'typeorm';
import { Customer } from '../modules/customer/entities/customer.entity';
import { Supplier } from '../modules/supplier/entities/supplier.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { Purchase } from '../modules/purchase/entities/purchase.entity';
import { Expense } from '../modules/expense/entities/expense.entity';
import { Employee } from '../modules/employee/entities/employee.entity';

/**
 * Relations used whenever a sale/purchase is returned as part of a details
 * response, so the caller can see the line items (product + variant) and the
 * counterparty.
 */
export const SALE_DETAIL_RELATIONS = {
  items: { product: true, variant: { variant: true, variantOption: true }, sku: { values: { variant: true, variantOption: true } } },
  customer: true,
  soldBy: true,
};

export const PURCHASE_DETAIL_RELATIONS = {
  items: { product: true, variant: { variant: true, variantOption: true }, sku: { values: { variant: true, variantOption: true } } },
  supplier: true,
  purchasedBy: true,
};

export interface IPartySource {
  entityType?: string;
  entityId?: string;
}

export function partyKey(entityType?: string, entityId?: string): string {
  return `${entityType || ''}:${entityId || ''}`;
}

/**
 * Bulk-resolves the customer/supplier/employee behind polymorphic
 * entityType/entityId references (payments, ledger entries, account
 * transactions). Returns a map keyed by `partyKey(entityType, entityId)`.
 */
export async function loadParties(
  sources: IPartySource[],
  customerRepo: Repository<Customer>,
  supplierRepo: Repository<Supplier>,
  employeeRepo?: Repository<Employee>,
): Promise<Map<string, Customer | Supplier | Employee>> {
  const customerIds = new Set<string>();
  const supplierIds = new Set<string>();
  const employeeIds = new Set<string>();

  for (const source of sources || []) {
    if (!source?.entityId) continue;
    if (source.entityType === 'customer') customerIds.add(source.entityId);
    else if (source.entityType === 'supplier') supplierIds.add(source.entityId);
    else if (source.entityType === 'employee') employeeIds.add(source.entityId);
  }

  const [customers, suppliers, employees] = await Promise.all([
    customerIds.size
      ? customerRepo.find({ where: { id: In([...customerIds]) } })
      : Promise.resolve([] as Customer[]),
    supplierIds.size
      ? supplierRepo.find({ where: { id: In([...supplierIds]) } })
      : Promise.resolve([] as Supplier[]),
    employeeRepo && employeeIds.size
      ? employeeRepo.find({ where: { id: In([...employeeIds]) } })
      : Promise.resolve([] as Employee[]),
  ]);

  const parties = new Map<string, Customer | Supplier | Employee>();
  customers.forEach((customer) => parties.set(partyKey('customer', customer.id), customer));
  suppliers.forEach((supplier) => parties.set(partyKey('supplier', supplier.id), supplier));
  employees.forEach((employee) => parties.set(partyKey('employee', employee.id), employee));
  return parties;
}

/** Bulk-loads sales (with items, customer and salesperson) keyed by id. */
export async function loadSales(
  ids: Array<string | null | undefined>,
  saleRepo: Repository<Sale>,
): Promise<Map<string, Sale>> {
  const uniqueIds = [...new Set((ids || []).filter(Boolean) as string[])];
  if (!uniqueIds.length) return new Map();

  const sales = await saleRepo.find({
    where: { id: In(uniqueIds) },
    relations: SALE_DETAIL_RELATIONS,
  });

  return new Map(sales.map((sale) => [sale.id, sale]));
}

/** Bulk-loads purchases (with items, supplier and purchaser) keyed by id. */
export async function loadPurchases(
  ids: Array<string | null | undefined>,
  purchaseRepo: Repository<Purchase>,
): Promise<Map<string, Purchase>> {
  const uniqueIds = [...new Set((ids || []).filter(Boolean) as string[])];
  if (!uniqueIds.length) return new Map();

  const purchases = await purchaseRepo.find({
    where: { id: In(uniqueIds) },
    relations: PURCHASE_DETAIL_RELATIONS,
  });

  return new Map(purchases.map((purchase) => [purchase.id, purchase]));
}

/** Bulk-loads expenses keyed by id. */
export async function loadExpenses(
  ids: Array<string | null | undefined>,
  expenseRepo: Repository<Expense>,
): Promise<Map<string, Expense>> {
  const uniqueIds = [...new Set((ids || []).filter(Boolean) as string[])];
  if (!uniqueIds.length) return new Map();

  const expenses = await expenseRepo.find({ where: { id: In(uniqueIds) } });
  return new Map(expenses.map((expense) => [expense.id, expense]));
}
