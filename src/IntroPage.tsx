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
          The CollaboUse is a creativity tests for individuals or teams inspired
          by the alternate uses task. You will receive a design challenge and
          your task is to come up with many different solutions in 3 minutes
          time.
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
          <br></br>
          <br></br>
          If you are curious about the evaluation of your results, feel free to
          contact us at{" "}
          <a href="mailto:neurodesign@hpi.de">neurodesign@hpi.de</a>
          <br></br>
          <br></br> To get started join an existing room or create a new one. If
          you wish to take the test as a team it is recommended that each team
          member join the room on their own device.
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
          onClick={() => joinRoom()}
          variant="contained"
        >
          Join New Room
        </Button>
      </div>
    </>
  );
}
