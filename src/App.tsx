import "./App.css";
import { useEffect, useState, createContext } from "react";
import openSocket from "socket.io-client";
import { collaboUseItems } from "./data";
import { IntroPage } from "./IntroPage";
import { RoomPage } from "./RoomPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const socket = openSocket();
export const SocketContext = createContext(socket);

function App() {
  const [room, setRoom] = useState("");
  const [rooms, setRoomList] = useState([] as string[]);
  const [connected, setConnected] = useState(true);
  socket.on("disconnect", () => setConnected(false));
  socket.on("connect", () => setConnected(true));
  socket.on("connect_error", () => setConnected(false));

  useEffect(() => {
    function updateRoomList(newRooms: string[]) {
      setRoomList(newRooms);
    }
    socket.on("roomList", updateRoomList);

    return () => {
      socket.off("roomList", updateRoomList);
    };
  }, []);

  function generateRoomName() {
    const item1: string =
      collaboUseItems[Math.floor(Math.random() * collaboUseItems.length)];
    const item2: string =
      collaboUseItems[Math.floor(Math.random() * collaboUseItems.length)];
    return item1 + "-" + item2 + "-" + Math.floor(Math.random() * 90 + 10);
  }

  function joinRoom(newRoom?: string) {
    if (!newRoom) newRoom = generateRoomName();
    socket.emit("join", newRoom);
    setRoom(newRoom);
  }

  function leaveRoom() {
    socket.emit("leave");
    setRoom("");
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <SocketContext.Provider value={socket}>
        <div className="App ">
          {!room ? (
            <IntroPage rooms={rooms} joinRoom={joinRoom} />
          ) : (
            <RoomPage room={room} leaveRoom={leaveRoom} />
          )}
          <div className="footer">
            <p style={{ fontSize: "10px", marginRight: "10px" }}>
              Sound effects by{" "}
              <a href="http://opengameart.org/users/varkalandar">
                Hansjörg Malthaner
              </a>
            </p>
          </div>
          {!connected && (
            <div className="connection-error">
              <p>A connection could not be established.</p>
            </div>
          )}
        </div>
      </SocketContext.Provider>
    </DndProvider>
  );
}

export default App;
