import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IMultiSelectProps, MultiselectWithTags } from "./MultiSelect";
import * as React from "react";

export class MultiSelectLookup
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
  private notifyOutputChanged: () => void;
  private context: ComponentFramework.Context<IInputs>;

  constructor() {}

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    // set the dataset paging to 5000 by default
    context.parameters.dataset.paging.setPageSize(5000);
  }

  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    this.context = context;
    const dataSet = context.parameters.dataset;

    // If the dataset is still loading, return an empty fragment
    if (context.parameters.dataset.loading) {
      console.log("loading");
      return React.createElement(React.Fragment);
    } else {
      // If there are more records to load, load them and return an empty fragment.
      // If this is not done, the control could possibly not load all the records only the number listed in the 'Maximum number of rows'
      // listed on the form settings.
      if (dataSet.paging.hasNextPage) {
        dataSet.paging.loadNextPage();
        return React.createElement(React.Fragment);
      }
    }
    const props: IMultiSelectProps = {
      utils: context.utils,
      webApi: context.webAPI,
      currentUserId: context.userSettings.userId,
      addNewCallback: this.addNewCallback.bind(this),
      allowAddNew: context.parameters.allowAddNew.raw,
      items: dataSet,
      navigateToRecord: this.navigateToRecord.bind(this),
      theme: context.fluentDesignLanguage?.tokenTheme,
      label: context.parameters.label.raw,
      thisTableName: context.parameters.entityName.raw!,
      thisRecordId: context.parameters.recordId.raw!,
      relationshipName: context.parameters.relationship.raw!,
      labelLocation:
        context.parameters.labelLocation.raw === "0" ? "above" : "left",
      labelWidth: context.parameters.labelWidth.raw ?? "",
      searchMode:
        context.parameters.searchMode.raw == "0" ? "simple" : "advanced",
      filter: context.parameters.customFilter.raw,
      order: context.parameters.customOrder.raw,
      bestEffort: false,
      searchColumns: "",
      matchWords: "all",
    };
    return React.createElement(MultiselectWithTags, props);
  }

  public addNewCallback(): void {
    let options: ComponentFramework.NavigationApi.EntityFormOptions = {
      entityName: this.context.parameters.dataset.getTargetEntityType(),
      useQuickCreateForm: true,
    };

    this.context.navigation.openForm(options);
  }

  public navigateToRecord(tableName: string, entityId: string): void {
    let opts: ComponentFramework.NavigationApi.EntityFormOptions = {
      entityName: tableName,
      entityId: entityId,
      openInNewWindow: true,
    };
    this.context.navigation.openForm(opts);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
