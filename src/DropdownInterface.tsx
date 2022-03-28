import {
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import {
  CollaboUseResult,
  CollaboUseSuggestion,
  CollaboUseSuggestionItem,
} from "./data_model";
import { Prompt } from "./ui/helpers";

const DarkerDisabledTextField = withStyles({
  root: {
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(0, 0, 0, 0.8)", // (default alpha is 0.38)
    },
  },
})(TextField);

export function DropdownInterface({
  result,
  editItem,
  addSuggestion,
  editSuggestionTitle,
  addItem,
}: {
  result: CollaboUseResult;
  editItem: (suggestionId: string, itemId: string, value: string) => void;
  addSuggestion: () => void;
  editSuggestionTitle: (id: string, title: string) => void;
  addItem: (
    suggestionId: string,
    addedItem: string
  ) => CollaboUseSuggestionItem;
}) {
  const playerId = localStorage.getItem("id");
  const urlParams = new URLSearchParams(window.location.search);
  const task = urlParams.get("task");

  function buildDropDown(
    suggestion: CollaboUseSuggestion,
    item: CollaboUseSuggestionItem
  ) {
    return (
      <Select
        className="item input"
        key={item.id}
        value={item.item ?? ""}
        onChange={(event) =>
          editItem(suggestion.id, item.id, event.target.value)
        }
      >
        {result.availableItems.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    );
  }
  function buildExample() {
    if (task !== "movie" && task !== "games") return;
    const suggestion =
      task === "games" ? 'Throw "ball" into hat' : "Alien costume";
    const items = task === "games" ? ["Apple", "Hat"] : ["DVD", "DVD", "Wire"];

    return (
      <div className="flex">
        <p className="example">Example:</p>
        <div className="suggestion-box">
          <DarkerDisabledTextField
            label="Suggestion"
            style={{
              width: "180px",
              marginBottom: "0.5rem",
              marginRight: "0.5rem",
            }}
            variant="outlined"
            value={suggestion}
            disabled={true}
          />

          {items.map((item) => (
            <DarkerDisabledTextField
              variant="outlined"
              style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              className="item"
              label="Item"
              select
              value={item}
              disabled={true}
            >
              <MenuItem value={item}>{item}</MenuItem>
            </DarkerDisabledTextField>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Prompt prompt={result.prompt} />
      <div className="items-list">
        {result.availableItems.map((item) => {
          return <p key={item}>{item}</p>;
        })}
      </div>
      {buildExample()}
      <div className="suggestion-box">
        {result.suggestions.map((suggestion) => {
          return (
            <div className="suggestion" key={suggestion.id}>
              <TextField
                placeholder="Your Suggestion"
                disabled={suggestion.addedBy !== playerId}
                className={
                  suggestion.addedBy !== playerId
                    ? "suggestion-inputs"
                    : "suggestion-inputs input"
                }
                value={suggestion.title}
                onChange={(event) =>
                  editSuggestionTitle(suggestion.id, event.target.value)
                }
              />
              {suggestion.items.map((item) =>
                item.addedBy === playerId ? (
                  buildDropDown(suggestion, item)
                ) : (
                  <p className="item" key={item.id}>
                    {item.item ?? ""}
                  </p>
                )
              )}
              <FormControl>
                <Select
                  variant="outlined"
                  className="item input"
                  value=""
                  displayEmpty
                  style={{ color: "#999" }}
                  onChange={(event: SelectChangeEvent<string>) => {
                    addItem(suggestion.id, event.target.value);
                  }}
                >
                  {[
                    <MenuItem key="empty" value="">
                      <em>Item</em>
                    </MenuItem>,
                    ...result.availableItems.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    )),
                  ]}
                </Select>
              </FormControl>
            </div>
          );
        })}
      </div>
      <Button
        style={{ marginBottom: "40px" }}
        className="suggestion-button"
        onClick={addSuggestion}
        variant="contained"
      >
        Add Suggestion
      </Button>
    </>
  );
}
