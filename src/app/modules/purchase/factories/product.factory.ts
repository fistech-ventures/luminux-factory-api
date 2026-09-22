import { Product } from '@src/app/modules/product/entities/product.entity';

export class ProductFactory {
  static createProduct(
    productCode: string,
    title: string,
    sourcingPrice: number,
    sellingPrice: number,
    stock: number,
    unit?: string,
  ): Product {
    const product = new Product();
    product.productCode = productCode;
    product.title = title;
    product.sourcingPrice = sourcingPrice;
    product.sellingPrice = sellingPrice;
    product.stock = stock;
    product.unit = unit;
    return product;
  }
}
