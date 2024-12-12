import * as React from "react";
import {
  Combobox,
  makeStyles,
  Option,
  tokens,
  useId,
  FluentProvider,
  SplitButton,
  Text,
  Button,
  Divider,
  Label,
  Field,
  ProgressBar,
} from "@fluentui/react-components";
import {
  Dismiss12Regular,
  GlobeSearchRegular,
  AddRegular,
} from "@fluentui/react-icons";
import { useDebounce } from "./Debouncer";
import {
  AdvancedSearchProvider,
  SimpleSearchProvider,
  SearchProvider,
} from "./SearchProvider";
import { AssociateRequest } from "./models/AssociateRequest";
import { DisassociateRequest } from "./models/DisassociateRequest";

export interface IMultiSelectProps {
  thisTableName: string;
  thisRecordId: string;
  items: ComponentFramework.PropertyTypes.DataSet;
  navigateToRecord: (tableName: string, entityId: string) => void;
  theme: any;
  utils: ComponentFramework.Utility;
  webApi: ComponentFramework.WebApi;
  currentUserId: string;
  addNewCallback: () => void;
  allowAddNew: boolean;
  label: string | null;
  relationshipName: string;
  labelLocation: "above" | "left";
  labelWidth: string | null;
  filter: string | null;
  order: string | null;
  bestEffort: boolean;
  searchMode: "simple" | "advanced";
  matchWords: "all" | "any";
  searchColumns: string;
}

const useStyles = makeStyles({
  root: {
    display: "grid",
    flexDirection: "row",
    gridTemplateRows: "repeat(1fr)",
    JustifyContent: "space-between",
    alignItems: "end",
    width: "100%",
    paddingTop: "8px",
    rowGap: "5px",
  },
  leftlabel: {
    display: "flex",
  },
  tagsList: {
    listStyleType: "none",
    marginBottom: tokens.spacingVerticalXXS,
    marginTop: 0,
    paddingTop: "3px",
    paddingLeft: 0,
    display: "flex",
    flexWrap: "wrap",
    gridGap: tokens.spacingHorizontalXXS,
  },
  wrapper: {
    columnGap: "15px",
    display: "flex",
    alignContent: "space-around",
  },
});

export const MultiselectWithTags: React.FC<IMultiSelectProps> = (
  props: IMultiSelectProps
) => {
  // #region State and Variables
  const [targetPrimaryColumn, setTargetPrimaryColumn] =
    React.useState<string>("");
  const [targetCollectionName, setTargetCollectionName] =
    React.useState<string>("");
  const [targetDisplayName, setTargetDisplayName] = React.useState<string>("");
  const [hasFocus, setHasFocus] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState<
    ComponentFramework.WebApi.Entity[]
  >([]);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [addNew, setAddNew] = React.useState<boolean>(false);
  const [progressBar, setProgressBar] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [searchProvider, setSearchProvider] = React.useState<SearchProvider>();
  const [simpleSearchTerm, setSimpleSearchTerm] = React.useState<string>("");

  const comboboxRef = React.useRef<HTMLInputElement | null>(null);
  const debouncedSearchTerm = useDebounce(inputValue, 400); // 500ms delay
  const comboId = useId("Multiselect-Search");
  const selectedListId = `${comboId}-selection`;
  const styles = useStyles();
  // #endregion

  // init search provider
  React.useEffect(() => {
    if (
      props.searchMode === "advanced" &&
      props.webApi &&
      props.items &&
      targetPrimaryColumn
    ) {
      setSearchProvider(
        new AdvancedSearchProvider(
          props.webApi,
          props.items.getTargetEntityType(),
          targetPrimaryColumn,
          props.filter,
          props.order,
          props.searchColumns.length > 0 ? props.searchColumns.split(",") : [],
          props.bestEffort,
          props.matchWords
        )
      );
    } else if (
      props.searchMode === "simple" &&
      props.webApi &&
      props.items &&
      targetPrimaryColumn
    ) {
      setSearchProvider(
        new SimpleSearchProvider(
          props.webApi,
          props.items.getTargetEntityType(),
          targetPrimaryColumn,
          props.filter,
          props.order
        )
      );
    }
  }, [
    props.searchMode,
    props.webApi,
    props.items,
    targetPrimaryColumn,
    props.filter,
    props.order,
    props.searchColumns,
    props.bestEffort,
    props.matchWords,
    props.searchMode,
  ]);

  // Get initial record set
  React.useEffect(() => {
    let search = async () => {
      searchProvider?.initialResults().then(
        (results) => {
          setOptions(results);
        },
        (error) => {
          console.error(error);
        }
      );
    };
    search();
  }, [searchProvider]);

  // Metadata Queries
  React.useEffect(() => {
    if (props.items) {
      props.utils
        .getEntityMetadata(props.items.getTargetEntityType())
        .then((metadata) => {
          setTargetPrimaryColumn(metadata["PrimaryNameAttribute"]);
          setTargetCollectionName(metadata["DisplayCollectionName"]);
          setTargetDisplayName(metadata["DisplayName"]);
        });
    }
  }, [props.items]);

  // default selected options
  React.useEffect(() => {
    if (props.items.sortedRecordIds.length > 0 && targetPrimaryColumn !== "") {
      setSelectedOptions(
        props.items.sortedRecordIds.map((id) =>
          props.items.records[id].getFormattedValue(targetPrimaryColumn)
        )
      );
    }
  }, [props.items, targetPrimaryColumn]);

  // input capture - Advanced
  React.useEffect(() => {
    let search = async () => {
      searchProvider?.search(debouncedSearchTerm).then(
        (results) => {
          setOptions(results);
        },
        (error) => {
          console.error(error);
        }
      );
    };

    if (debouncedSearchTerm) {
      search();
    }
  }, [debouncedSearchTerm]);

  // input capture - Simple
  React.useEffect(() => {
    let search = async () => {
      searchProvider?.search(simpleSearchTerm).then(
        (results) => {
          setOptions(results);
        },
        (error) => {
          console.error(error);
        }
      );
    };
    search();
  }, [simpleSearchTerm]);

  const onSelectItems = async (items: string[]) => {
    const newOptions: string[] = [];
    const removedOptions: string[] = [];

    if (items.length > 0) {
      if (selectedOptions.length === 0) {
        newOptions.push(...items);
      } else {
        newOptions.push(...items.filter((x) => !selectedOptions.includes(x)));
        removedOptions.push(
          ...selectedOptions.filter((x) => !items.includes(x))
        );
      }
    } else {
      removedOptions.push(...selectedOptions);
    }

    setProgressBar(true);

    // Associate new records
    for (const opt of newOptions) {
      const id = options.find(
        (option) => option[targetPrimaryColumn] === opt
      )?.[`${props.items.getTargetEntityType()}id`];

      if (id) {
        try {
          const associateRequest = new AssociateRequest(
            { entityType: props.items.getTargetEntityType(), id },
            [{ entityType: props.thisTableName, id: props.thisRecordId }],
            props.relationshipName
          );

          ///@ts-expect-error execute associate request
          await props.webApi.execute(associateRequest);
        } catch (error) {
          console.error("Error associating record:", error);
        }
      }
    }

    // Disassociate removed records
    for (const opt of removedOptions) {
      const id = props.items.sortedRecordIds.find(
        (x) =>
          props.items.records[x].getFormattedValue(targetPrimaryColumn) === opt
      );

      if (id) {
        try {
          const disassociateRequest = new DisassociateRequest(
            { entityType: props.thisTableName, id: props.thisRecordId },
            id,
            props.relationshipName
          );

          ///@ts-expect-error execute disassociate request
          await props.webApi.execute(disassociateRequest);
        } catch (error) {
          console.error("Error disassociating record:", error);
        }
      }
    }
    //this ensures that the dataset is refreshed after the associate/disassociate operation otherwise if you switch
    //tabs and come back the changes are not reflected
    props.items.refresh();
    setProgressBar(false);
  };

  // fire AddNew callback
  React.useEffect(() => {
    if (addNew) {
      //TODO: find a cleaner way to drop focus on AddNew: Combobox can sometimes overlay the QuickCreate panel for a second
      if (comboboxRef.current) {
        comboboxRef.current.blur();
      }
      // document.getElementById("DS-Search-Combo")?.focus();
      // document.getElementById("DS-Search-Combo")?.blur();
      props.addNewCallback();
      setAddNew(false);
    }
  }, [addNew]);

  // navigate to record on tag primary click
  const onClickPrimary = (option: string) => {
    props.navigateToRecord(
      props.items.getTargetEntityType(),
      props.items.sortedRecordIds.find(
        (id) =>
          props.items.records[id].getFormattedValue(targetPrimaryColumn) ===
          option
      )!
    );
  };

  // disassociate record on tag close click
  const onClickClose = (option: string) => {
    onSelectItems(selectedOptions.filter((opt) => opt !== option));
  };

  return (
    <FluentProvider
      theme={props.theme}
      style={{ width: "100%" }}
      className={
        props.labelLocation === "above" ? styles.root : styles.leftlabel
      }
    >
      <Label style={{ width: props.labelWidth ?? "140px", paddingTop: "5px" }}>
        {props.label}
      </Label>
      <div className={styles.root} style={{ width: "320px" }}>
        <Combobox
          ref={comboboxRef}
          multiselect={true}
          selectedOptions={selectedOptions}
          appearance="filled-lighter"
          aria-labelledby={comboId}
          placeholder={hasFocus ? "" : "---"}
          style={{ background: "#F5F5F5", width: "300px", paddingTop: "0px" }}
          expandIcon={<GlobeSearchRegular />}
          onFocus={(_e) => {
            setHasFocus(true);
          }}
          onBlur={(_e) => {
            setHasFocus(false);
          }}
          onInput={(ev: React.ChangeEvent<HTMLInputElement>) => {
            props.searchMode === "advanced"
              ? setInputValue(ev.target.value)
              : setSimpleSearchTerm(ev.target.value);
          }}
          onOptionSelect={(_event, data) => {
            onSelectItems(data.selectedOptions);
          }}
          type="search"
        >
          {targetCollectionName && (
            <Text
              style={{
                margin: "5px",
                padding: "5px",
              }}
            >
              All {targetCollectionName ?? ""}
            </Text>
          )}
          {options &&
            options.length > 0 &&
            options.map((option) => (
              <Option key={option[targetPrimaryColumn]}>
                {option[targetPrimaryColumn]}
              </Option>
            ))}
          {props.allowAddNew && (
            <>
              <Divider />
              <div className={styles.wrapper}>
                <Button
                  icon={<AddRegular />}
                  appearance="subtle"
                  onClick={() => setAddNew(true)}
                >
                  New {targetDisplayName ?? ""}
                </Button>
              </div>
            </>
          )}
        </Combobox>
        {progressBar && (
          <Field validationMessage="saving..." validationState="none">
            <ProgressBar />
          </Field>
        )}
        {selectedOptions.length ? (
          // testing future consolidation of tags and search box
          // <div style={{background: "#F5F5F5", borderRadius:"5px", width: "100%", height: "auto", alignItems:"center"}} className={styles.leftlabel}>
          <ul id={selectedListId} className={styles.tagsList}>
            {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
            <span id={`${comboId}-remove`} hidden>
              Remove
            </span>
            {selectedOptions.map((option, i) => (
              <li key={option}>
                <SplitButton
                  size="small"
                  shape="circular"
                  appearance="primary"
                  menuButton={{
                    style: {
                      color: "rgb(17, 94, 163)",
                      background: "rgb(235, 243, 252)",
                    },
                    onClick: () => onClickClose(option),
                  }}
                  menuIcon={<Dismiss12Regular />}
                  primaryActionButton={{
                    style: {
                      color: "rgb(17, 94, 163)",
                      background: "rgb(235, 243, 252)",
                    },
                    onClick: () => onClickPrimary(option),
                  }}
                  id={`${comboId}-remove-${i}`}
                  aria-labelledby={`${comboId}-remove ${comboId}-remove-${i}`}
                >
                  {option}
                </SplitButton>
              </li>
            ))}
          </ul>
        ) : // testing future consolidation of tags and search box
        // <GlobeSearchRegular style={{height: "20px", width: "20px", flexShrink: 0, color: "#616161", paddingRight: "8px"}}/>
        // </div>
        null}
      </div>
    </FluentProvider>
  );
};
