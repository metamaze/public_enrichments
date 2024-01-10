export class File {
  id: string;
  name: string;
  url: string;
  pageIds: string[];
}

export class Page {
  id: string;
  fileId: string;
  text: string;
  index: number;
  height: number;
  width: number;
  /**
   * Only available if the project is using page management
   */
  documentTypeConfidence: number;
  /**
   * Only available if the project is using page management
   */
  pageManagementConfidence: number;
}

export class DocumentType {
  id: string;
  name: string;
  threshold: number;
  /**
   * Only available if the project is using document classification
   */
  confidence: number;
}

export class Entity {
  id: string;
  name: string;
  threshold: number;
  /**
   * If number parsing is enabled for the entity, it will be `NUMBER`
   * If date parsing is enabled for the entity, it will be `DATE`
   * else it will be `REGULAR`
   */
  type: 'REGULAR' | 'NUMBER' | 'DATE';
  /**
   * Specified in the entity settings
   */
  class: 'TEXT' | 'IMAGE' | 'COMPOSITE' | 'PARAGRAPH' | 'REGEX' | 'CHECKBOX' | 'RELATION';
}

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class Coords {
  pageId: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class Indice {
  pageId: string;
  start: number;
  end: number;
}
export class Annotation {
  id: string;
  entityId: string;
  /**
   * If it's a child of a composite, the refs will contain 1 ID to its parent
   * If it's a dependency of a relation/group, the refs can contain multiple IDs to its root(s)
   */
  refs: string[];
  entityExtractionConfidence: number;
  ocrConfidence: number;
  confidence: number;
  rawValue: string;
  parsedValue: string | number;
  /**
   * Is the same as `parsedValue` if present, else it's the same as `rawValue`
   */
  value: string | number;
  /**
   * AI = predicted by an AI model
   * HUMAN = labeled on the document by a human
   * MANUAL = manually added by a human, is not present on the document itself
   */
  source: 'AI' | 'HUMAN' | 'MANUAL';
  /**
   * If the annotation is labeled by a human, it will be filled in.
   */
  user: User | null;
  /**
   * Only available if the entity's class is CHECKBOX
   */
  checked: boolean | null;
  /**
   * Only available if the entity's class is IMAGE
   */
  image: string | null;
  /**
   * * Image entity: type = CoordsResponse
   * * Text entity: type = CoordsResponse[]
   * * Checkbox entity: type = CoordsResponse[]
   * * Paragraph entity: type = CoordsResponse[]
   * * Regex entity: type = CoordsResponse[]
   * * Composite entity: type = null
   * * Relation entity: type = null
   */
  coords: Coords[] | Coords | null;
  indices: Indice[];
}

export class PostProcessedAnnotation {
  entityId: string;
  value: string;
  confidence: number;
  /**
   * Contains ID's that refer to `document.annotations`
   */
  annotationIds: string[];
  /**
   * Contains ID's that refer to `document.postProcessedAnnotations`
   * Only available if the entity is part of a composite or relation
   */
  refs: string[];
}

export class BusinessRule {
  id: string;
  name: string;
  isBlocking: boolean;
  isSuccessful: boolean;
}
export class Enrichment {
  id: string;
  name: string;
  type: 'ENTITY' | 'DOCUMENT' | 'ENRICHMENT';
}

export class EnrichmentValue {
  id: string;
  enrichment: Enrichment;
  /**
   * Only available if the `enrichment.type` is `ENRICHMENT` & linked to another enrichment value
   */
  ref: string | null;
  value: unknown[] | string;
  exception: string | null;
  /**
   * Status code  = response status code from the endpoint.
   * If manually modified, the status code will be 600
   */
  statusCode: number;
}

export class Document {
  id: string;
  status: 'FAILED' | 'DONE' | 'IN_PROGRESS' | 'INPUT_REQUIRED';
  /**
   * Alpha 2 code in lowercase
   * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements
   * @example en
   * @example fr
   * @example nl
   */
  language: string;
  name: string;
  step: 'DOCUMENT_CLASSIFICATION' | 'ENTITY_EXTRACTION';
  documentType: DocumentType;
  pageIds: string[];
  entities: Entity[];
  annotations: Annotation[];
  postProcessedAnnotations: PostProcessedAnnotation[];
  businessRules: BusinessRule[];
  enrichmentValues: EnrichmentValue[];
  createdAt: Date;
  updatedAt: Date;
}

export class RequestBodyV3<Metadata = Record<string, unknown>> {
  /**
   * Contains Metadata specified in the enrichment settings and/or metadata specified on the upload
   */
  metadata: Metadata;
  version: '3';
  /**
   * Upload ID
   */
  id: string;
  projectId: string;
  organisationId: string;
  status: 'FAILED' | 'DONE' | 'IN_PROGRESS' | 'INPUT_REQUIRED';
  step: 'INPUT' | 'OCR' | 'PAGE_MANAGEMENT' | 'ENTITY_EXTRACTION' | 'DOCUMENT_CLASSIFICATION' | 'OUTPUT';
  files: File[];
  pages: Page[];
  document: Document;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
}

export class Result {
  enrichments: {
    link: string;
    name: string;
    value: string | unknown[] | null;
    exception: string | null;
  }[];
}
