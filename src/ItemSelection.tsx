import { Button, Checkbox } from "@mui/material";
import { CollaboUseResult } from "./data_model";

export function ItemSelectionPage({
  result,
  onItemSelected,
  room,
}: {
  result: CollaboUseResult;
  onItemSelected: (suggestionId: string) => void;
  room: string;
}) {
  const playerId = localStorage.getItem("id") ?? "";
  const urlParams = new URLSearchParams(window.location.search);
  const task = urlParams.get("task");

  function downloadData() {
    const data = `data:,${JSON.stringify(result)}`;
    const date = new Date(Date.now());
    const dateString =
      date.getFullYear() +
      "-" +
      date.getMonth().toString().padStart(2, "0") +
      "-" +
      date.getDay().toString().padStart(2, "0") +
      "-" +
      date.getHours() +
      "-" +
      date.getMinutes();
    const filename = dateString + "_" + room + ".json";
    const aTag = document.createElement("a");

    aTag.href = data;
    aTag.download = filename;
    aTag.click();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function downloadDataAsCsv() {
    let data: string = "RoomId, Order, ItemName, ItemElement, BranchId\n";
    let order = 1;
    result.suggestions.forEach((suggestion) => {
      suggestion.items.forEach((item) => {
        data += `${room}, ${order}, ${suggestion.title}, ${item.item}, \n`;
        order++;
      });
      data += `${room}, ${order}, ${suggestion.title}, end, \n`;
      order++;
    });
    const filename = room + ".csv";

    data = `data:text/csv;charset=utf-8,${data}`;

    var encodedUri = encodeURI(data);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
  }

  return (
    <>
      <p className="row">
        Now, select your two favorite suggestions. This is done individually,
        you and your team do not need to agree.
      </p>
      {result.suggestions.map((suggestion) => (
        <div key={suggestion.id} className="row">
          <Checkbox
            checked={suggestion.selectedBy.includes(playerId)}
            onChange={() => onItemSelected(suggestion.id)}
          />
          <b>{suggestion.title}&nbsp;</b>
          {suggestion.items.map((item, index) => (
            <p key={item.id}>
              {item.item}
              {index + 1 !== suggestion.items.length ? "," : ""}
              &nbsp;
            </p>
          ))}
        </div>
      ))}
      <div>
        {/*<Button
          variant="contained"
          className="button"
          onClick={downloadDataAsCsv}
        >
          Download As CSV
        </Button>*/}
        {task && (
          <div style={{ width: "600px", margin: "0 auto" }}>
            Once all team members have selected their favorite items, choose one
            of your team members to download the data set and send it to
            corinna.jaschek@hpi.de, along with your id: <b>{playerId}</b>
          </div>
        )}
        <Button variant="contained" className="button" onClick={downloadData}>
          Download
        </Button>
      </div>
    </>
  );
}
