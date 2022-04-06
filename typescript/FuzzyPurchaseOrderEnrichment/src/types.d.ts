/**
 * Information about the entity value and the entity 'template'.
 */
export type EntityRequestBody = {
  entityId: string; // ID of the Entity under 'entities' table (entity template)
  entityName: string; // Name of the Entity under 'entities' table (entity template)
  text: string; // Text from the entity value
  userId: string;
  isApproved: boolean;
  labeledByAIModel: boolean;
  parsedValue: string;
  link: string; // ID of the entity value (f.e. from a matched entity value under document)
};

/**
 * Information about the composite entity value, it's children and the entity 'template'
 */
export type CompositeRequestBody = EntityRequestBody & {
  // Composite have an extra attribute ('composites') to show their children
  composites: (EntityRequestBody & {
    compositeGroupId: string; // So we can link the children to their composite parent
  })[];
};

/**
 * Request body that is sent to the user in order to receive a response
 * * entities: contain all simple entities
 * * composities: contain all composite entities (composite groups), each composite has also a composites attribute that contains all children of the composite group
 */
export type RequestBody = {
  documentId: string;
  language: string;
  text: string;
  entities: EntityRequestBody[];
  composites: CompositeRequestBody[];
};

export type AirTableRecord = {
  supplierPostalCode: string;
  supplierStreet: string;
  supplierCity: string;
  supplierName: string;
  supplierHouseNumber: string;
  supplierId: string;
};

export type FuseAirTableRecord = {
  item: AirTableRecord;
  refIndex: number;
  score: number;
};

export type Enrichment = {
  name: string;
  value?: string;
  link: string;
  exception?: string;
};

export type Match = {
  entity: EntityRequestBody;
  match: FuseAirTableRecord;
};
