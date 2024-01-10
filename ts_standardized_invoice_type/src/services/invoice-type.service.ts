import { RequestBodyV3, Result } from '@/types/enrichmentsV3';
import { HttpException, Injectable } from '@nestjs/common';

export type FindText = { key: 'find-text'; metadata: { entityId: string; percentage: number; page: number } };
export type NegativeAmount = {
  key: 'negative-amount';
  metadata: { entityId: string };
};
export type Action = FindText | NegativeAmount;

export type Metadata = {
  /**
   * Name of the enrichment configured in the UI
   */
  name: string;
  /**
   * Return value when it's a credit note
   */
  credit: string;
  /**
   * Return value when it's an invoice
   */
  debit: string;
  /**
   * Actions to execute, configured in the enrichment settings
   */
  actions: Action[];
};

@Injectable()
export class InvoiceTypeService {
  /**
   * Executes for every action in the metadata the correct rule.
   * If one of the actions is true, it's a credit note.
   * @param data
   * @returns
   */
  enrichment(data: RequestBodyV3<Metadata>): Result {
    let isCreditNote = false;
    // execute every action, if one of them is true, it's a credit note
    const actions = data.metadata.actions || [];
    for (const action of actions) {
      if (action.key === 'find-text') {
        const result = this.findText(action.metadata, data);
        if (result) isCreditNote = true;
      }
      if (action.key === 'negative-amount') {
        const result = this.negativeAmount(action.metadata, data);
        if (result) isCreditNote = true;
      }
    }

    return {
      enrichments: [
        {
          name: data.metadata.name,
          link: data.document.id,
          exception: null,
          value: isCreditNote ? data.metadata.credit : data.metadata.debit
        }
      ]
    };
  }

  /**
   * Checks is an annotation is within a certain percentage of the page.
   *
   * @param metadata.entityId entity ID is configured in the UI
   * @param metadata.percentage percentage of the page to search for the text (top-to-bottom)
   * @param metadata.page page index to specify which page
   * @param data request body
   * @returns {boolean} within boundary
   */
  findText(metadata: FindText['metadata'], data: RequestBodyV3<Metadata>): boolean {
    const { entityId, percentage, page: pageIndex } = metadata;

    // Error handling
    if (!entityId) throw new HttpException('Entity ID is not specified in action', 400);
    if (percentage < 0 || percentage > 100)
      throw new HttpException(`Percentage in action is not valid: ${percentage}`, 400);
    if (typeof pageIndex !== 'number') throw new HttpException('Page is not specified in action', 400);

    const annotations = data.document.annotations.filter((a) => a.entityId === entityId && a.coords);
    const pageId = data.document.pageIds[pageIndex];
    const page = data.pages.find((p) => p.id === pageId);
    if (!page)
      throw new HttpException(`Page index ${pageIndex} could not be resolved in document ${data.document.id}`, 400);

    const boundary = page.height * (percentage / 100);
    const withingBoundary = annotations.some((annotation) => {
      if (Array.isArray(annotation.coords)) {
        return annotation.coords.some((coord) => coord.pageId === pageId && coord.y0 < boundary);
      }
      return annotation.coords.pageId === pageId && annotation.coords.y0 < boundary;
    });
    return withingBoundary;
  }

  /**
   * Checks if an annotation has a negative amount.
   *
   * @param metadata.entityId entity ID is configured in the UI
   * @param data request body
   * @returns {boolean} annotation with given entity ID contains a negative amount
   */
  negativeAmount(metadata: NegativeAmount['metadata'], data: RequestBodyV3<Metadata>) {
    const { entityId } = metadata;
    if (!entityId) throw new HttpException('Entity ID is not specified in action', 400);
    const annotations = data.document.annotations.filter((a) => a.entityId === entityId);
    const hasNegativeAmount = annotations.some(
      (annotation) => typeof annotation.value === 'number' && annotation.value < 0
    );
    return hasNegativeAmount;
  }

  /**
   * Options that can be used during human validation.
   * Metamaze expects an array of objects with a label and a value.
   *
   * @param data
   * @returns
   */
  options(data: RequestBodyV3<Metadata>) {
    return [
      { label: 'credit', value: data.metadata.credit },
      { label: 'debit', value: data.metadata.debit }
    ];
  }
}
