import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { InvoiceTypeModule } from './services/invoice-type.module';
import { InvoiceTypeService } from './services/invoice-type.service';

@Module({
  imports: [InvoiceTypeModule],
  controllers: [AppController],
  providers: [InvoiceTypeService]
})
export class AppModule {}
