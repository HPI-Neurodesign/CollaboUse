import { collaboUseItems, collaboUsePrompts } from "./src/data.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { clearInterval } from "timers";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const TIMER_TIME = 180;
let currentRooms = [];

function getRoom(room) {
  return currentRooms.find((r) => r.id === room);
}

class Room {
  data = {};
  id = null;
  timer = null;
  timeLeft = TIMER_TIME;

  constructor(id) {
    this.id = id;
    this.data = {
      availableItems: [],
      prompt: "",
      suggestions: [],
    };
  }
}

Room.prototype.timerFunction = function (client) {
  this.timeLeft--;
  io.to(this.id).emit("timerUpdate", this.timeLeft);
  client.emit("timerUpdate", this.timeLeft);
  if (this.timeLeft === 0) {
    io.to(this.id).emit("timerEnded");
    client.emit("timerEnded");
    clearInterval(this.timer);
  }
};

function getPromptForToken(task) {
  if (task === "games") {
    return [
      "entertaining games for a group of friends",
      [
        "Needle",
        "Mirror",
        "Apple",
        "Hammer",
        "Jacket",
        "Hat",
        "Ring",
        "Table",
        "Rope",
        "Ketchup",
      ],
    ];
  } else if (task === "movie") {
    return [
      "decorating items for a science fiction movie",
      [
        "DVD",
        "Nail",
        "Ink",
        "Wire",
        "Chair",
        "Tire",
        "Shoe",
        "Blanket",
        "Screwdriver",
        "Orange",
      ],
    ];
  } else {
    return [generatePrompt(), generateItems()];
  }
}

function generatePrompt() {
  return Array.from(collaboUsePrompts).sort(() => 0.5 - Math.random())[0];
}

function generateItems() {
  return Array.from(collaboUseItems)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);
}

function getRooms() {
  const rooms = [];
  io.sockets.adapter.rooms.forEach((val, key) => {
    if (!val.has(key)) {
      rooms.push(key);
    }
  });
  return rooms;
}

function deleteDataIfNecessary() {
  const existingRooms = getRooms();
  const updatedRooms = [];
  currentRooms.forEach((room) => {
    if (existingRooms.includes(room.id)) updatedRooms.push(room);
    else {
      clearInterval(room.timer);
    }
  });
}

io.on("connection", (client) => {
  client.emit("roomList", getRooms() ?? []);

  client.on("suggestionAdded", ({ roomID, suggestion, clientId }) => {
    const room = getRoom(roomID);
    if (room && room.data && room.data.suggestions) {
      room.data.suggestions.push(suggestion);
    }
    client.to(roomID).emit("suggestionAdded", { suggestion, clientId });
  });

  client.on("suggestionUpdated", ({ roomID, id, title, clientId }) => {
    const room = getRoom(roomID);
    if (room && room.data && room.data.suggestions) {
      room.data.suggestions = room.data.suggestions.map((s) =>
        s.id === id ? { ...s, title } : s
      );
    }
    client.to(roomID).emit("suggestionUpdated", { id, title, clientId });
  });

  client.on("itemUpdated", ({ roomID, suggestionId, item, clientId }) => {
    const room = getRoom(roomID);
    if (room && room.data && room.data.suggestions) {
      room.data.suggestions = room.data.suggestions.map((s) =>
        s.id === suggestionId
          ? { ...s, items: s.items.map((i) => (i.id === item.id ? item : i)) }
          : s
      );
    }
    client.to(roomID).emit("itemUpdated", { suggestionId, item, clientId });
  });

  client.on("itemAdded", ({ roomID, item, suggestionId, clientId }) => {
    const room = getRoom(roomID);
    if (room && room.data && room.data.suggestions) {
      room.data.suggestions = room.data.suggestions.map((s) =>
        s.id === suggestionId ? { ...s, items: [...s.items, item] } : s
      );
    }
    client.to(roomID).emit("itemAdded", { item, suggestionId, clientId });
  });

  client.on("getNewTask", (roomID) => {
    const prompt = generatePrompt();
    const items = generateItems();
    const room = getRoom(roomID);

    room.data = { prompt, availableItems: items, suggestions: [] };
    io.to(roomID).emit("newTask", { prompt, items, suggestions: [] });
  });

  client.on("getTask", (roomID, task) => {
    const room = getRoom(roomID);
    const res = getPromptForToken(task);

    room.data = { prompt: res[0], availableItems: res[1], suggestions: [] };
    io.to(roomID).emit("newTask", {
      prompt: res[0],
      items: res[1],
      suggestions: [],
    });
  });

  client.on("leave", () => {
    //leave all rooms, we can only be in one at a time
    io.sockets.adapter.rooms.forEach((room, key) => {
      if (room.has(client.id)) {
        client.leave(key);
      }
    });
    //if empty rooms are created delete them
    deleteDataIfNecessary();
    //send available rooms to all clients
    const rooms = getRooms() ?? [];
    client.broadcast.emit("roomList", rooms);
    client.emit("roomList", rooms);
  });

  client.on("join", (newRoom) => {
    //leave all other rooms, we can only be in one at a time
    io.sockets.adapter.rooms.forEach((room, key) => {
      if (room.has(client.id)) {
        client.leave(key);
      }
    });
    //if empty rooms are created delete them
    deleteDataIfNecessary();
    //join new room
    client.join(newRoom);
    //if it doesn't exist in our list create it
    if (!getRoom(newRoom)) currentRooms.push(new Room(newRoom));

    //send updated state
    client.emit("roomState", getRoom(newRoom).data);
    if (getRoom(newRoom).timer)
      client.emit("timerUpdate", getRoom(newRoom).timeLeft);

    //send available rooms to all clients
    const rooms = getRooms() ?? [];
    client.broadcast.emit("roomList", rooms);
    client.emit("roomList", rooms);
  });

  client.on("disconnect", () => {
    deleteDataIfNecessary();
    client.broadcast.emit("roomList", getRooms() ?? []);
  });

  client.on("startTimer", (roomID) => {
    const room = getRoom(roomID);
    if (room.timer) clearInterval(room.timer);
    room.timeLeft = TIMER_TIME;
    room.timer = setInterval(room.timerFunction.bind(room, client), 1000);
  });

  client.on(
    "suggestionSelectionUpdated",
    ({ roomID, suggestionId, playerId }) => {
      const room = getRoom(roomID);
      room.data = {
        ...room.data,
        suggestions: room.data.suggestions.map((s) => {
          if (s.id !== suggestionId) return s;
          const newSelection = s.selectedBy.includes(playerId)
            ? s.selectedBy.filter((id) => id !== playerId)
            : s.selectedBy.concat(playerId);
          return {
            ...s,
            selectedBy: newSelection,
          };
        }),
      };
      io.to(roomID).emit("suggestionSelectionUpdated", {
        suggestionId,
        playerId,
      });
    }
  );
});

const port = 8000;
httpServer.listen(port);
console.log("listening on port", port);
