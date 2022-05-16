import { Button } from "@mui/material";

export function IntroPage({
  rooms,
  joinRoom,
}: {
  rooms: string[];
  joinRoom: any;
}) {
  const urlParams = new URLSearchParams(window.location.search);
  const task = urlParams.get("task");
  return (
    <>
      <h2>Welcome to CollaboUse</h2>
      {task ? (
        <p style={{ marginBottom: "1rem" }} className="centered-text">
          This task will be performed in teams of two. To get started please
          join the same room, and make sure you have a way to communicate with
          each other (e.g. Discord, Zoom etc.)
          <br></br>
          <br></br>
          On the next page, you receive a design challenge and your task is to
          come up with many different solutions in 3 minutes time.
          <br></br>
          <br></br>
          For instance, your job can be to create “tools to survive in the
          wilderness”. As building material, you have ten objects. Use and
          combine them to create your solutions. For instance, when you have a
          blanket and sticks, you can combine them to build a tent to survive in
          the wilderness. Each of the ten objects can be re-used as often as you
          like.
          <br></br>
          <br></br>
          Try to produce as many, diverse, and original solutions as you can in
          the given time!
        </p>
      ) : (
        <p style={{ marginBottom: "1rem" }} className="centered-text">
          In this association game, you receive a design challenge. Your task is
          to <b>think up solutions in 3 minutes</b> time.
          <br></br>
          <br></br>
          Try to name as <b>many, diverse, and original-creative</b> solutions
          as you can!
          <br></br>
          <br></br>
          For instance, your job might be to create “tools to survive in the
          wilderness”. As building material, you have ten objects. Use and
          combine them to create your solutions. For example, when you have a
          blanket and stick, you can combine them to make a flag, so as to mark
          your camp and find it from a distance. Your 10 basic objects can be
          re-used as often as you like.
          <br></br>
          <br></br> To get started join an existing room or create a new one.
        </p>
      )}
      <div>
        {rooms.map((r: string) => (
          <Button
            className="room-button"
            key={r}
            onClick={() => joinRoom(r)}
            variant="contained"
            color="secondary"
          >
            Join {r}
          </Button>
        ))}
        <Button
          className="room-button"
          onClick={() => {
            var roomName = prompt("Please enter your identifier") ?? "";
            roomName = roomName
              .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "_")
              .replace(/\u00df/g, "ss")
              .replace(/\u00e4/g, "ae")
              .replace(/\u00f6/g, "oe")
              .replace(/\u00fc/g, "ue")
              .replace(/\u00c4/g, "Ae")
              .replace(/\u00d6/g, "Oe")
              .replace(/\u00dc/g, "Ue");
            joinRoom(roomName);
          }}
          variant="contained"
        >
          Join New Room
        </Button>
      </div>
    </>
  );
}
