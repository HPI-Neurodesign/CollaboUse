import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { CollaboUseResult, CollaboUseSuggestionItem } from "./data_model";
import { Prompt } from "./ui/helpers";

function DraggableItem({ item }: { item: string }) {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "item",
      item: { item },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    []
  );

  return (
    <div
      ref={dragRef}
      className="drag-drop"
      style={{
        opacity,
      }}
    >
      {item}
    </div>
  );
}

function DropArea({
  onDrop,
  collaboUseItem,
}: {
  onDrop: any;
  collaboUseItem?: CollaboUseSuggestionItem;
}) {
  const [hoveredItem, setHoveredItem] = useState("");

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "item",
    drop: (item: CollaboUseSuggestionItem) => {
      onDrop(item.item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    hover: (item: CollaboUseSuggestionItem) => setHoveredItem(item.item),
  }));

  const className =
    !isOver && collaboUseItem === undefined ? "drop-new-area" : "";
  const moreClassName = canDrop && !isOver ? "can-drop" : "";
  return (
    <div
      ref={drop}
      className={`drag-drop drop-area ${className} ${moreClassName}`}
    >
      {isOver ? hoveredItem : collaboUseItem?.item ?? "+"}
    </div>
  );
}

export function DragDropInterface({
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
  return (
    <>
      <Prompt prompt={result.prompt} />
      <div className="items-list">
        {result.availableItems.map((item) => {
          return <DraggableItem key={item} item={item} />;
        })}
      </div>
      <div className="suggestion-box">
        {result.suggestions.map((suggestion) => {
          return (
            <div className="suggestion" key={suggestion.id}>
              <TextField
                placeholder="Your Suggestion"
                disabled={suggestion.addedBy !== playerId}
                className="suggestion-inputs"
                value={suggestion.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  editSuggestionTitle(suggestion.id, event.target.value)
                }
              />
              {suggestion.items.map((item: CollaboUseSuggestionItem) =>
                item.addedBy === playerId ? (
                  <DropArea
                    key={item.id}
                    onDrop={(newValue: string) =>
                      editItem(suggestion.id, item.id, newValue)
                    }
                    collaboUseItem={item}
                  />
                ) : (
                  <p className="item" key={item.id}>
                    {item.item ?? ""}
                  </p>
                )
              )}
              <DropArea
                onDrop={(newValue: string) => addItem(suggestion.id, newValue)}
              ></DropArea>
            </div>
          );
        })}
      </div>
      <Button
        variant="contained"
        className="suggestion-button"
        onClick={addSuggestion}
      >
        Add Suggestion
      </Button>
    </>
  );
}
