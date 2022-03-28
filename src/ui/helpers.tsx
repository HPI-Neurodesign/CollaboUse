import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";

export function CountdownTimer({ timeLeft }: { timeLeft: number }) {
  return (
    <div style={{ width: 120, height: 120, margin: "1rem auto" }}>
      <CircularProgressbarWithChildren
        strokeWidth={8}
        value={timeLeft}
        maxValue={180}
        styles={buildStyles({
          textColor: timeLeft < 10 ? "darkred" : "#333",
          pathColor: timeLeft < 10 ? "darkred" : "#333",
          trailColor: "lightgrey",
          strokeLinecap: "round",
        })}
      >
        <p
          style={{
            fontWeight: "bold",
            fontSize: timeLeft !== 0 ? "30px" : "20px",
            marginTop: timeLeft !== 0 ? "22px" : "9px",
          }}
        >
          {timeLeft !== 0 ? timeLeft.toString() : "Time's Up"}
        </p>
      </CircularProgressbarWithChildren>
    </div>
  );
}

export function Prompt({ prompt }: { prompt: string }) {
  return <h2 style={{ margin: "0 0.5rem" }}>{prompt}</h2>;
}

export enum DisplayTypes {
  DnD,
  Dropdowns,
}

export function InputTypeSelection(
  currentValue: DisplayTypes,
  onValueChange:
    | ((event: React.ChangeEvent<HTMLInputElement>, value: string) => void)
    | undefined
) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
      }}
    >
      <FormControl component="fieldset">
        <FormLabel component="legend">Input Type</FormLabel>
        <RadioGroup
          name="controlled-radio-buttons-group"
          value={currentValue}
          onChange={onValueChange}
        >
          <FormControlLabel
            value={DisplayTypes.DnD}
            control={<Radio />}
            label="Drag & Drop"
          />
          <FormControlLabel
            value={DisplayTypes.Dropdowns}
            control={<Radio />}
            label="Dropdowns"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
}
