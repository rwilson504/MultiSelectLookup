export class DisassociateRequest {
    target: { entityType: string; id: string };
    relatedEntityId: string;
    relationship: string;
  
    constructor(
      target: { entityType: string; id: string },
      relatedEntityId: string,
      relationship: string
    ) {
      this.target = target;
      this.relatedEntityId = relatedEntityId;
      this.relationship = relationship;
    }
  
    getMetadata() {
      return {
        boundParameter: null,
        parameterTypes: {},
        operationType: 2, // CRUD Operation
        operationName: "Disassociate",
      };
    }
  }
  