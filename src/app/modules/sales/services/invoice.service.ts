import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HtmlHelper, PdfGeneratorHelper, R2UploadHelper } from '@src/app/helpers';
import { GlobalConfigService } from '@src/app/modules/globalConfig/services/globalConfig.service';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import * as fs from 'fs';
import * as path from 'path';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';

interface IInvoiceItem {
  title: string;
  variantLabel?: string;
  warranty?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total: number;
}

/**
 * Builds and stores the PDF invoice for a sale.
 *
 * - The layout comes from views/pdf-templates/sale-invoice.template.hbs and is
 *   rendered with the business header from the global config.
 * - The PDF is generated with the shared puppeteer helper and uploaded to
 *   Cloudflare R2; the public URL is stored on the sale (invoiceUrl).
 * - Generation is intentionally non-fatal: callers must not fail a sale
 *   because PDF/storage hiccuped. The GET /internal/sales/:id/invoice
 *   endpoint can regenerate the PDF on demand from live data.
 */
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    private readonly htmlHelper: HtmlHelper,
    private readonly pdfGeneratorHelper: PdfGeneratorHelper,
    private readonly r2UploadHelper: R2UploadHelper,
    private readonly globalConfigService: GlobalConfigService,
  ) {}

  private readonly logger = new Logger(InvoiceService.name);

  private readonly saleRelations = {
    items: {
      product: true,
      variant: { variant: true, variantOption: true },
      sku: { values: { variant: true, variantOption: true } },
    },
    customer: true,
    soldBy: true,
  };

  /** Loads a sale with everything the invoice needs. */
  async findSaleWithInvoiceData(id: string): Promise<Sale> {
    return await this.saleRepo.findOne({
      where: { id, isDeleted: false },
      relations: this.saleRelations,
    });
  }

  /** Renders the invoice HTML for a (fully loaded) sale. */
  async renderInvoiceHtml(sale: Sale): Promise<string> {
    return await this.renderInvoiceTemplate(sale, 'sale-invoice');
  }

  /** Generates the invoice PDF for a (fully loaded) sale. */
  async generateInvoicePdf(sale: Sale): Promise<Buffer> {
    const html = await this.renderInvoiceHtml(sale);
    return await this.pdfGeneratorHelper.createPDF(html, { format: 'A4' });
  }

  /**
   * Generates the invoice PDF for a sale, deletes the old copy from R2,
   * and stores the new one under the same file name. Throws on any failure.
   */
  async regenerateInvoice(saleId: string): Promise<string> {
    const sale = await this.findSaleWithInvoiceData(saleId);
    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const oldUrl = sale.invoiceUrl;
    if (oldUrl) {
      const oldKey = this.r2UploadHelper.parseR2Key(oldUrl);
      if (oldKey) {
        await this.r2UploadHelper.deleteFile(oldKey);
      }
    }

    return await this.generateAndStoreInvoice(saleId);
  }

  /**
   * Generates the invoice PDF for a sale and stores it on Cloudflare R2,
   * returning the public URL. Throws on any failure so the caller can decide
   * how to handle it.
   */
  async generateAndStoreInvoice(saleId: string): Promise<string> {
    const sale = await this.findSaleWithInvoiceData(saleId);
    if (!sale) {
      throw new Error(`Sale not found: ${saleId}`);
    }

    const pdfBuffer = await this.generateInvoicePdf(sale);
    const fileName = `${sale.invoiceNo || sale.id}.pdf`;

    const url = await this.r2UploadHelper.uploadBinary(
      'invoices',
      pdfBuffer,
      fileName,
      'application/pdf',
    );

    if (!url) {
      throw new Error(`R2 upload returned empty URL for sale ${saleId}`);
    }

    await this.saleRepo.update({ id: sale.id }, { invoiceUrl: url });
    return url;
  }

  /** Renders the invoice HTML for a (fully loaded) sale using the specified template. */
  private async renderInvoiceTemplate(sale: Sale, templateName: string): Promise<string> {
    let business: Record<string, any> = {};
    try {
      const config = await this.globalConfigService.getConfig();
      business = {
        name: config.name,
        logo: config.logo,
        address: config.address,
        phone: config.phone,
        currency: config.currency ? `${config.currency}` : '',
      };
    } catch (error) {
      this.logger.warn('Global config unavailable for invoice, using empty business block', error);
    }

    const items: IInvoiceItem[] = (sale.items || []).map((item) => ({
      title: item.product?.title || 'Unknown product',
      variantLabel: this.getVariantLabel(item),
      warranty: item.product?.warranty,
      quantity: item.quantity,
      unit: item.sku?.unit || item.product?.unit,
      unitPrice: this.round2(item.sellingPrice),
      total: this.round2(item.totalAmount),
    }));

    const customerCompany = sale.customer?.companyName;
    const customerName = sale.customer?.name || 'Walk-in Customer';
    const customerAddress = sale.customer?.address;

    // Convert images to base64 for PDF generation
    let headerImageBase64 = '';
    let footerImageBase64 = '';
    let watermarkImageBase64 = '';

    try {
      const headerImagePath = path.join(process.cwd(), 'assets/invoice-header.png');
      const headerImageBuffer = fs.readFileSync(headerImagePath);
      headerImageBase64 = `data:image/png;base64,${headerImageBuffer.toString('base64')}`;
    } catch (error) {
      this.logger.warn(
        'Header image not found, invoice will be generated without header image',
        error,
      );
    }

    try {
      const footerImagePath = path.join(process.cwd(), 'assets/invoice-footer.png');
      const footerImageBuffer = fs.readFileSync(footerImagePath);
      footerImageBase64 = `data:image/png;base64,${footerImageBuffer.toString('base64')}`;
    } catch (error) {
      this.logger.warn(
        'Footer image not found, invoice will be generated without footer image',
        error,
      );
    }

    try {
      const watermarkImagePath = path.join(process.cwd(), 'assets/watermark-image.png');
      const watermarkImageBuffer = fs.readFileSync(watermarkImagePath);
      watermarkImageBase64 = `data:image/png;base64,${watermarkImageBuffer.toString('base64')}`;
    } catch (error) {
      this.logger.warn(
        'Watermark image not found, invoice will be generated without watermark',
        error,
      );
    }

    const data = {
      business,
      invoiceCode: sale.invoiceNo || sale.id,
      date: sale.date ? dayjs(sale.date).format('DD MMM YYYY') : '',
      paymentStatus: this.getPaymentStatus(sale),
      customerName,
      customerPhone: sale.customer?.contactNumber,
      customerAddress,
      customerCompany,
      shippingTo: sale.shippingTo || customerCompany || customerName,
      shippingAddress: sale.shippingAddress || customerAddress || '',
      shippingContact: sale.shippingContact || sale.customer?.contactNumber || '',
      soldByName: sale.soldBy?.fullName || '—',
      paymentMethod: sale.paymentMethod || '—',
      items,
      subTotal: this.round2(sale.totalAmount),
      discount: this.round2(sale.discount),
      grandTotal: this.round2(sale.grandTotal),
      paidAmount: this.round2(sale.paidAmount),
      dueAmount: this.round2(sale.dueAmount),
      currencyName: 'Taka',
      headerImage: headerImageBase64,
      footerImage: footerImageBase64,
      watermarkImage: watermarkImageBase64,
    };

    return await this.htmlHelper.createHtmlContent(data, templateName);
  }

  /** Rounds to 2 decimals and returns a plain number (safe for the words helper). */
  private round2(value: number): number {
    return Math.round((value || 0) * 100) / 100;
  }

  private getPaymentStatus(sale: Sale): 'PAID' | 'PARTIAL' | 'DUE' {
    if (!sale.dueAmount || sale.dueAmount <= 0) return 'PAID';
    if (!sale.paidAmount || sale.paidAmount <= 0) return 'DUE';
    return 'PARTIAL';
  }

  private getVariantLabel(item: SaleItem): string | undefined {
    if (item.sku) {
      const values = (item.sku.values || [])
        .map((value) => [value.variant?.title, value.variantOption?.title].filter(Boolean).join(': '))
        .filter(Boolean)
        .join(', ');
      return values || undefined;
    }

    const variantTitle = item.variant?.variant?.title;
    const optionTitle = item.variant?.variantOption?.title;
    if (variantTitle && optionTitle) return `${variantTitle}: ${optionTitle}`;
    return optionTitle || variantTitle || undefined;
  }
}
