import { RequestBodyV3 } from '@/types/enrichmentsV3';
import { Test, TestingModule } from '@nestjs/testing';
import { FindText, InvoiceTypeService, Metadata, NegativeAmount } from './invoice-type.service';
import mock1 from './mocks/mock-1.json';
import mock2 from './mocks/mock-2.json';
import mock3 from './mocks/mock-3.json';

describe('InvoiceTypeService', () => {
  let invoiceTypeService: InvoiceTypeService;
  let moduleRef: TestingModule;
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [InvoiceTypeService]
    }).compile();
  });

  describe('findText', () => {
    it('should not find a credit note in mocka-1', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      expect(
        invoiceTypeService.findText(
          mock1.metadata.actions[0].metadata as FindText['metadata'],
          mock1 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(false);
    });

    it('should find a credit note in mock-2 (within the boundary)', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      expect(
        invoiceTypeService.findText(
          mock2.metadata.actions[0].metadata as FindText['metadata'],
          mock2 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(true);
    });

    it('should not find a credit note in mock-3 (outside the boundary)', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      expect(
        invoiceTypeService.findText(
          mock3.metadata.actions[0].metadata as FindText['metadata'],
          mock3 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(false);
    });
  });

  describe('negativeAmount', () => {
    it('Should not find any negative amounts for mocka-1', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const actions = mock1.metadata.actions.slice(1) || [];

      for (const action of actions) {
        expect(
          invoiceTypeService.negativeAmount(
            action.metadata as NegativeAmount['metadata'],
            mock1 as unknown as RequestBodyV3<Metadata>
          )
        ).toBe(false);
      }
    });
    it('Should not find any negative amounts for mocka-1', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const actions = mock2.metadata.actions.slice(1) || [];

      for (const action of actions) {
        expect(
          invoiceTypeService.negativeAmount(
            action.metadata as NegativeAmount['metadata'],
            mock1 as unknown as RequestBodyV3<Metadata>
          )
        ).toBe(false);
      }
    });

    it('Should not find any negative amounts for mocka-1', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const actions = mock2.metadata.actions || [];

      const action1 = actions[1];
      const action2 = actions[2];
      const action3 = actions[3];
      const action4 = actions[4];

      expect(
        invoiceTypeService.negativeAmount(
          action1.metadata as NegativeAmount['metadata'],
          mock3 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(true);
      expect(
        invoiceTypeService.negativeAmount(
          action2.metadata as NegativeAmount['metadata'],
          mock3 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(false);
      expect(
        invoiceTypeService.negativeAmount(
          action3.metadata as NegativeAmount['metadata'],
          mock3 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(false);
      expect(
        invoiceTypeService.negativeAmount(
          action4.metadata as NegativeAmount['metadata'],
          mock3 as unknown as RequestBodyV3<Metadata>
        )
      ).toBe(false);
    });
  });

  describe('enrichment', () => {
    it('Should return a debit for mock-1', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const result = invoiceTypeService.enrichment(mock1 as unknown as RequestBodyV3<Metadata>);

      expect(result.enrichments[0].value).toBe(mock1.metadata.debit);
    });

    it('Should return a credit for mock-2', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const result = invoiceTypeService.enrichment(mock2 as unknown as RequestBodyV3<Metadata>);

      expect(result.enrichments[0].value).toBe(mock2.metadata.credit);
    });

    it('Should return a credit for mock-3', () => {
      invoiceTypeService = moduleRef.get<InvoiceTypeService>(InvoiceTypeService);

      const result = invoiceTypeService.enrichment(mock3 as unknown as RequestBodyV3<Metadata>);

      expect(result.enrichments[0].value).toBe(mock3.metadata.credit);
    });
  });
});
