export class AssociateRequest {
    target: { entityType: string; id: string };
    relatedEntities: { entityType: string; id: string }[];
    relationship: string;
  
    constructor(
      target: { entityType: string; id: string },
      relatedEntities: { entityType: string; id: string }[],
      relationship: string
    ) {
      this.target = target;
      this.relatedEntities = relatedEntities;
      this.relationship = relationship;
    }
  
    getMetadata() {
      return {
        boundParameter: null,
        parameterTypes: {},
        operationType: 2, // CRUD Operation
        operationName: "Associate",
      };
    }
  }
  