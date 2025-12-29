import { useState } from 'react'
import './App.css'

type RPE = 5 | 6 | 7 | 8 | 9 | 10;

// These functions are derived from linear regressions of the RPE chart data
// used in my rpe Elm calculator at  github.com/zack/rpe-elm.git
const RPE_FUNCTIONS = {
  5: (x: number) => -0.0261*(x-1) + 0.828,
  6: (x: number) => -0.0260*(x-1) + 0.856,
  7: (x: number) => -0.0262*(x-1) + 0.891,
  8: (x: number) => -0.0259*(x-1) + 0.917,
  9: (x: number) => -0.0262*(x-1) + 0.947,
  10: (x: number) => -0.0277*(x-1) + 0.993,
}

const getRPECoefficient = (reps: RPE, rpe: number) => {
  // The new functions aren't perfect here due to a greater falloff
  // at high reps at 10RPE. Clamp this to 1 for nicer nubmers.
  if (rpe === 10) {
    return 1;
  }

  const lowerRPEValue = RPE_FUNCTIONS[Math.floor(rpe) as RPE](reps);
  const upperRPEValue = RPE_FUNCTIONS[Math.ceil(rpe) as RPE](reps);

  return lowerRPEValue + ((upperRPEValue - lowerRPEValue) * (rpe % 1));
}

function App() {
  const [startingWeight, setStartingWeight] = useState("");
  const [startingReps, setStartingReps] = useState(0);
  const [startingRPE, setStartingRPE] = useState("");

  const [targetReps, setTargetReps] = useState(0);
  const [targetRPE, setTargetRPE] = useState("");

  const [startingRPEFocused, setStartingRPEFocused] = useState(false);
  const [targetRPEFocused, setTargetRPEFocused] = useState(false);

  const startingWeightNum = Number(startingWeight);
  const startingRPENum = Number(startingRPE);
  const targetRPENum = Number(targetRPE);

  const errors = {
    startingWeight: "",
    startingReps: "",
    startingRPE: "",
    targetReps: "",
    targetRPE: "",
  };

  if (startingWeight && isNaN(startingWeightNum)) {
    errors.startingWeight = "Weight must be a number";
  } else if (startingWeight && Number(startingWeight) < 0) {
    errors.startingWeight = "Weight must be greater than 0";
  }

  if (startingReps && startingReps < 0) {
    errors.startingReps = "Reps must be a positive number";
  }

  if (startingRPENum && !(startingRPEFocused && startingRPENum === 1) && (startingRPENum < 5 || startingRPENum > 10)) {
    errors.startingRPE = "RPE must be between 5 and 10";
  }

  if (targetReps && targetReps < 0) {
    errors.targetReps = "Reps must be a positive number";
  }

  if (targetRPENum && !(targetRPEFocused && targetRPENum === 1) && (targetRPENum < 5 || targetRPENum > 10)) {
    errors.targetRPE = "RPE must be between 5 and 10";
  }

  const e1RM =
    startingWeightNum
    && !errors.startingWeight
    && startingReps
    && !errors.startingReps
    && startingRPENum
    && startingRPENum > 1
    && !errors.startingRPE
    && (startingWeightNum / getRPECoefficient(startingReps as RPE, startingRPENum));

  if (e1RM && e1RM < 0) {
    errors.startingReps = "Reps too high"
  }

  const showE1RM = !errors.startingReps && e1RM;

  const targetWeight =
    e1RM
    && targetReps
    && !errors.targetReps
    && targetRPENum
    && targetRPENum > 1
    && !errors.targetRPE
    && e1RM * getRPECoefficient(targetReps as RPE, targetRPENum);

  if (showE1RM && targetWeight && targetWeight < 0) {
    errors.targetReps = "Reps too high"
  }

  const showTargetWeight = !errors.targetReps && targetWeight;


  return (
    <>
      <div className="header">
        <h1> RPE Calculator </h1>
      </div>

      <div className="subheader">
        <h2> Starting Values</h2>
      </div>

      <div className={`input-row ${errors.startingWeight && "error"}`}>
        <div className="input-container">
          <label htmlFor="starting-weight"> Weight </label>

          <input
            className="text"
            id="starting-weight"
            inputMode="numeric"
            onChange={(e) => setStartingWeight(e.target.value.replace(/[^0-9.]/g,""))}
            type="text"
            value={startingWeight ? startingWeight : ""}
          />
        </div>

        <div className="error">{errors.startingWeight}</div>
      </div>

      <div className={`input-row ${errors.startingReps && "error"}`}>
        <div className="input-container">
          <label htmlFor="starting-reps"> Reps </label>

          <input
            className="text"
            id="starting-reps"
            inputMode="numeric"
            onChange={(e) => setStartingReps(Number(e.target.value))}
            value={startingReps ? startingReps : ""}
          />
        </div>

        <div className="error">{errors.startingReps}</div>
      </div>

      <div className={`input-row border-bottom ${errors.startingRPE && "error"}`}>
        <div className="input-container">
          <label htmlFor="starting-RPE"> RPE </label>

          <input
            className="text"
            id="starting-rpe"
            inputMode="numeric"
            onBlur={() => setStartingRPEFocused(false)}
            onChange={(e) => setStartingRPE(e.target.value.replace(/[^0-9.]/g,""))}
            onFocus={() => setStartingRPEFocused(true)}
            value={startingRPENum ? startingRPE : ""}
          />
        </div>

        <div className="error">{errors.startingRPE}</div>
      </div>

      <div className="subheader">
        <h2> Target Values</h2>
      </div>

      <div className={`input-row ${errors.targetReps && "error"}`}>
        <div className="input-container">
          <label htmlFor="target-reps"> Reps </label>

          <input
            className="text"
            id="target-reps"
            inputMode="numeric"
            onChange={(e) => setTargetReps(Number(e.target.value))}
            value={targetReps ? targetReps : ""}
          />
        </div>

        <div className="error">{errors.targetReps}</div>
      </div>

      <div className={`input-row border-bottom ${errors.targetRPE && "error"}`}>
        <div className="input-container">
          <label htmlFor="target-RPE"> RPE </label>

          <input
            className="text"
            id="target-rpe"
            inputMode="numeric"
            onBlur={() => setTargetRPEFocused(false)}
            onChange={(e) => setTargetRPE(e.target.value)}
            onFocus={() => setTargetRPEFocused(true)}
            value={targetRPE ? targetRPE : ""}
          />
        </div>

        <div className="error">{errors.targetRPE}</div>
      </div>

      <div className="results">
        <div> Target weight: { showTargetWeight ? targetWeight.toFixed(2) : "..." } </div>
        <div> E1RM: { showE1RM ? e1RM.toFixed(2) : "..." } </div>
      </div>
    </>
  )
}

export default App
