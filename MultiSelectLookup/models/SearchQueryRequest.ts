export class SearchQueryRequest {
    orderby: string | null;
    options: string | null;
    entities: string;
    search: string;
    count: boolean;
  
    constructor(
      search: string,
      entities: any[],
      options: object,
      orderby: string[] | null,
      count: boolean,
    ) {
      this.search = search;
      this.entities = JSON.stringify(entities);
      this.options = options ? JSON.stringify(options) : null;
      this.orderby = orderby ? JSON.stringify(orderby) : null;
      this.count = count;
    }
  
    getMetadata() {
      return {
        boundParameter: null,
        parameterTypes: {
          orderby: { typeName: "Edm.String", structuralProperty: 1 },
          skip: { typeName: "Edm.Int32", structuralProperty: 1 },
          facets: { typeName: "Edm.String", structuralProperty: 1 },
          propertybag: { typeName: "Edm.String", structuralProperty: 1 },
          options: { typeName: "Edm.String", structuralProperty: 1 },
          entities: { typeName: "Edm.String", structuralProperty: 1 },
          search: { typeName: "Edm.String", structuralProperty: 1 },
          filter: { typeName: "Edm.String", structuralProperty: 1 },
          top: { typeName: "Edm.Int32", structuralProperty: 1 },
          count: { typeName: "Edm.Boolean", structuralProperty: 1 },
        },
        operationType: 0, // Action
        operationName: "searchquery",
      };
    }
  }