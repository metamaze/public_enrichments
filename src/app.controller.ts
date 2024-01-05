import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { InvoiceTypeService, Metadata } from './services/invoice-type.service';
import { RequestBodyV3 } from './types/enrichmentsV3';

@Controller()
export class AppController {
  constructor(private invoiceTypeService: InvoiceTypeService) {}

  @Post('/invoice-type')
  @HttpCode(201)
  invoiceType(@Body() data: RequestBodyV3<Metadata>) {
    return this.invoiceTypeService.enrichment(data);
  }
}
