import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./App";
import {
  CollaboUseResult,
  CollaboUseSuggestion,
  CollaboUseSuggestionItem,
} from "./data_model";
import { v4 as uuid } from "uuid";
import { DropdownInterface } from "./DropdownInterface";
import { DragDropInterface } from "./DragDropInterface";
import { Button } from "@mui/material";
import { CountdownTimer, DisplayTypes } from "./ui/helpers";
import { ItemSelectionPage } from "./ItemSelection";

const TIMER_TIME = 180;

export function RoomPage({
  room,
  leaveRoom,
}: {
  room: string;
  leaveRoom: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(null as null | number);
  const socket = useContext(SocketContext);
  const [result, setResult] = useState({
    prompt: "",
    suggestions: [],
    id: uuid(),
    availableItems: [],
  } as CollaboUseResult);
  const [inputType, setInputType] = useState<DisplayTypes>(
    DisplayTypes.Dropdowns
  );
  const playerId = localStorage.getItem("id");
  const urlParams = new URLSearchParams(window.location.search);
  const task = urlParams.get("task");

  if (localStorage.getItem("id") == null) {
    localStorage.setItem("id", uuid());
  }

  useEffect(() => {
    function updateTask({
      prompt,
      items,
      suggestions,
    }: {
      prompt: string;
      items: string[];
      suggestions: CollaboUseSuggestion[];
    }) {
      setResult((r) => ({
        ...r,
        prompt,
        availableItems: items,
        suggestions,
      }));
    }
    socket.on("newTask", updateTask);

    function suggestionUpdated({
      id,
      title,
      clientId,
    }: {
      id: string;
      title: string;
      clientId: string;
    }) {
      if (playerId !== clientId) onSuggestionUpdated(id, title);
    }
    socket.on("suggestionUpdated", suggestionUpdated);

    function suggestionAdded({
      suggestion,
      clientId,
    }: {
      suggestion: CollaboUseSuggestion;
      clientId: string;
    }) {
      if (playerId !== clientId) onSuggestionAdded(suggestion);
    }
    socket.on("suggestionAdded", suggestionAdded);

    function itemUpdated({
      suggestionId,
      item,
      clientId,
    }: {
      suggestionId: string;
      item: CollaboUseSuggestionItem;
      clientId: string;
    }) {
      if (playerId !== clientId) onItemUpdated(suggestionId, item);
    }
    socket.on("itemUpdated", itemUpdated);

    function itemAdded({
      item,
      suggestionId,
      clientId,
    }: {
      item: CollaboUseSuggestionItem;
      suggestionId: string;
      clientId: string;
    }) {
      if (playerId !== clientId) onItemAdded(item, suggestionId);
    }
    socket.on("itemAdded", itemAdded);

    function updateTimeLeft(timeLeft: number) {
      setTimeLeft(timeLeft);
    }
    socket.on("timerUpdate", updateTimeLeft);

    function timeUp() {
      setTimeLeft(0);
      const audio = new Audio(
        "https://opengameart.org/sites/default/files/hjm-glass_bell_1.wav"
      );
      audio.play();
    }
    socket.on("timerEnded", timeUp);

    function updateState(state: CollaboUseResult) {
      setResult(state);
    }
    socket.on("roomState", updateState);

    function selectItem({
      suggestionId,
      playerId,
    }: {
      suggestionId: string;
      playerId: string;
    }) {
      onItemSelected(suggestionId, playerId);
    }
    socket.on("suggestionSelectionUpdated", selectItem);

    return () => {
      socket.off("timerUpdate", updateTimeLeft);
      socket.off("timerEnded", timeUp);
      socket.off("suggestionAdded", suggestionAdded);
      socket.off("newTask", updateTask);
      socket.off("suggestionUpdated", suggestionUpdated);
      socket.off("itemUpdated", itemUpdated);
      socket.off("itemAdded", itemAdded);
      socket.off("roomState", updateState);
      socket.off("suggestionSelectionUpdated", selectItem);
    };
  });

  function addSuggestion() {
    const suggestion = {
      title: "",
      addedBy: playerId,
      id: uuid(),
      items: [],
      selectedBy: [],
    };
    onSuggestionAdded(suggestion);
    socket.emit("suggestionAdded", {
      roomID: room,
      suggestion,
      clientId: playerId,
    });
  }

  function editSuggestionTitle(id: string, title: string) {
    onSuggestionUpdated(id, title);
    socket.emit("suggestionUpdated", {
      roomID: room,
      id,
      title,
      clientId: playerId,
    });
  }

  function addItem(suggestionId: string, addedItem: string) {
    const item = {
      item: addedItem,
      addedBy: playerId,
      id: uuid(),
    } as CollaboUseSuggestionItem;
    onItemAdded(item, suggestionId);
    socket.emit("itemAdded", {
      roomID: room,
      item,
      suggestionId,
      clientId: playerId,
    });
    return item;
  }

  function editItem(suggestionId: string, itemId: string, value: string) {
    let item = {
      addedBy: playerId,
      item: value,
      id: itemId,
    } as CollaboUseSuggestionItem;
    onItemUpdated(suggestionId, item);
    socket.emit("itemUpdated", {
      roomID: room,
      suggestionId,
      item,
      clientId: playerId,
    });
  }

  function onSuggestionAdded(suggestion: CollaboUseSuggestion) {
    setResult((res) => ({
      ...res,
      suggestions: [...res.suggestions, suggestion],
    }));
  }

  function onSuggestionUpdated(id: string, title: string) {
    setResult((r) => ({
      ...r,
      suggestions: r.suggestions.map((s) =>
        s.id === id ? { ...s, title } : s
      ),
    }));
  }

  function onItemAdded(item: CollaboUseSuggestionItem, suggestionId: string) {
    setResult((r) => ({
      ...r,
      suggestions: r.suggestions.map((s) =>
        s.id === suggestionId ? { ...s, items: [...s.items, item] } : s
      ),
    }));
  }

  function onItemUpdated(suggestionId: string, item: CollaboUseSuggestionItem) {
    setResult((res) => ({
      ...res,
      suggestions: res.suggestions.map((s) =>
        s.id === suggestionId
          ? { ...s, items: s.items.map((i) => (i.id === item.id ? item : i)) }
          : s
      ),
    }));
  }

  function itemSelected(suggestionId: string) {
    socket.emit("suggestionSelectionUpdated", {
      roomID: room,
      suggestionId,
      playerId,
    });
  }

  function onItemSelected(suggestionId: string, id: string | null = playerId) {
    if (!id) return;
    setResult((res) => ({
      ...res,
      suggestions: res.suggestions.map((s) => {
        if (s.id !== suggestionId) return s;
        const newSelection = s.selectedBy.includes(id)
          ? s.selectedBy.filter((currentId) => currentId !== id)
          : s.selectedBy.concat(id);
        return {
          ...s,
          selectedBy: newSelection,
        };
      }),
    }));
  }
  function roomSelection() {
    return (
      <div className="room-button-container">
        <p className="current-room-name">{room}</p>
        <Button
          variant="contained"
          className="button"
          color="error"
          onClick={() => {
            setTimeLeft(null);
            leaveRoom();
          }}
        >
          Leave Room
        </Button>
        <Button
          className="button"
          variant="contained"
          onClick={() => {
            if (task) socket.emit("getTask", room, task);
            else socket.emit("getNewTask", room);
            socket.emit("startTimer", room);
            setTimeLeft(180);
          }}
        >
          Start New Task
        </Button>
      </div>
    );
  }

  function body() {
    switch (inputType) {
      case DisplayTypes.DnD:
        return (
          <DragDropInterface
            result={result}
            editItem={editItem}
            addItem={addItem}
            addSuggestion={addSuggestion}
            editSuggestionTitle={editSuggestionTitle}
          />
        );
      case DisplayTypes.Dropdowns:
        return (
          <DropdownInterface
            result={result}
            editItem={editItem}
            addItem={addItem}
            addSuggestion={addSuggestion}
            editSuggestionTitle={editSuggestionTitle}
          />
        );
      default:
        return (
          <DropdownInterface
            result={result}
            editItem={editItem}
            addItem={addItem}
            addSuggestion={addSuggestion}
            editSuggestionTitle={editSuggestionTitle}
          />
        );
    }
  }

  function promptExists() {
    return result.prompt !== "" && result.availableItems.length === 10;
  }

  return (
    <>
      {roomSelection()}
      {/*InputTypeSelection(inputType, (event) =>
        setInputType(parseInt(event.target.value))
      )*/}
      <p className="centered-text" style={{ marginTop: "1rem" }}>
        Come up with as many ideas for the design prompt as you can within{" "}
        {TIMER_TIME} seconds. Use any item as often as you like. Feel free to
        talk and collaborate.
        <br />
        <br />
        Use the "Add Suggestion" button, to add your ideas. Type your idea in
        the first field, the "Suggestion" field, and select items using the
        dropdowns. You can build on each other ideas and add items to them.
        However, for technical reasons, you are only able to edit your own
        suggestions.
        {!promptExists() && (
          <>
            <br />
            <br />
            To begin generate a prompt and items by clicking the button on the
            right.
          </>
        )}
      </p>
      {timeLeft !== null && <CountdownTimer timeLeft={timeLeft} />}
      {timeLeft !== null && timeLeft <= 0 && (
        <ItemSelectionPage
          result={result}
          onItemSelected={itemSelected}
          room={room}
        />
      )}
      {timeLeft !== null && timeLeft > 0 && promptExists() && body()}
    </>
  );
}
