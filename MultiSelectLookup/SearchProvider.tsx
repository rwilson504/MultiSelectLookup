import { SearchQueryRequest } from "./models/SearchQueryRequest";

export interface Entity {
  name: string;
  filter?: string;
  searchColumns?: string[];
}

//base class for search providers
export class SearchProvider {
  tableName: string;
  webApi: ComponentFramework.WebApi;
  primaryColumn: string;
  filter: string | null;
  order: string | null;

  constructor(
    webApi: ComponentFramework.WebApi,
    tableName: string,
    primaryColumn: string,
    filter: string | null,
    order: string | null
  ) {
    this.webApi = webApi;
    this.tableName = tableName;
    this.primaryColumn = primaryColumn;
    this.filter = filter;
    this.order = order;
  }

  initialResults = async () => {
    return [] as ComponentFramework.WebApi.Entity[];
  };

  search = async (query: string) => {
    return [] as ComponentFramework.WebApi.Entity[];
  };
}

export class SimpleSearchProvider extends SearchProvider {
  records: ComponentFramework.WebApi.Entity[];

  initialResults = async (): Promise<ComponentFramework.WebApi.Entity[]> => {
    const res = await this.webApi
      .retrieveMultipleRecords(
        this.tableName,
        `?$select=${this.primaryColumn},${this.tableName}id${
          this.filter ? "&$filter=".concat(this.filter) : ""
        }${this.order ? "&$orderby=".concat(this.order) : ""}`
      )
      .then(
        (response) => {
          this.records = response.entities;
          return response.entities;
        },
        (error) => {
          console.error(error);
          return [];
        }
      );
    return res;
  };

  search = async (
    query: string
  ): Promise<ComponentFramework.WebApi.Entity[]> => {
    let res = this.records.filter((record) => {
      return (record[this.primaryColumn] as string)
        .toLowerCase()
        .includes(query.toLowerCase());
    });
    return res;
  };
}

export class AdvancedSearchProvider extends SearchProvider {
  bestEffort: boolean;
  matchWords: string;
  searchColumns: string[];

  constructor(
    webApi: ComponentFramework.WebApi,
    tableName: string,
    primaryColumn: string,
    filter: string | null,
    order: string | null,
    searchColumns: string[] = [],
    bestEffort: boolean,
    matchWords: string
  ) {
    super(webApi, tableName, primaryColumn, filter, order);
    this.bestEffort = bestEffort;
    this.matchWords = matchWords;
    this.searchColumns = searchColumns;
  }

  initialResults = async (): Promise<ComponentFramework.WebApi.Entity[]> => {
    let simpleProvider = new SimpleSearchProvider(
      this.webApi,
      this.tableName,
      this.primaryColumn,
      this.filter,
      this.order
    );
    let res = simpleProvider.initialResults().then((results) => {
      return results;
    });
    return res;
  };

  search = async (query: string): Promise<ComponentFramework.WebApi.Entity[]> => {
    try {
      // Construct the entities array
      const entities = [
        {
          Name: this.tableName,
          SelectColumns: [this.primaryColumn],
          SearchColumns: this.searchColumns.length > 0 ? this.searchColumns : undefined,
          Filter: this.filter || undefined,
        },
      ];

      // Create a custom request object
      const searchQueryRequest = new SearchQueryRequest(
        query,
        entities,
        {
          besteffortsearchenabled: this.bestEffort,
          searchmode: this.matchWords,
        },
        this.order ? [this.order] : null,
        true        
      );

      ///@ts-expect-error execute the request
      const response = await this.webApi.execute(searchQueryRequest);

      if (response.ok) {
        const responseBody = await response.json();
        const parsedResponse = JSON.parse(responseBody.response);

        // Extract and map results
        const results = parsedResponse.Value.map((record: any) => record.Attributes);
        return results as ComponentFramework.WebApi.Entity[];
      } else {
        console.error("Search query failed:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error executing searchQuery action:", error);
      return [];
    }
  };
}
