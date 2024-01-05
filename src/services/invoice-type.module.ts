import { Module } from '@nestjs/common';
import { InvoiceTypeService } from './invoice-type.service';

@Module({
  providers: [InvoiceTypeService]
})
export class InvoiceTypeModule {}
