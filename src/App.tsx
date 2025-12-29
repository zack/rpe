import { useState } from 'react'
import './App.css'

function App() {

  return (
    <>
      <div className="header">
        <h1> RPE Calculator </h1>
      </div>

      <div className="subheader">
        <h2> Starting Values</h2>
      </div>

      <div className="input-row">
        <div className="input-container">
          <label htmlFor="starting-weight"> Weight </label>
          <input
            className="text"
            id="starting-weight"
            inputMode="numeric"
            pattern="[0-9\.]*"
          />
        </div>
      </div>

      <div className="input-row">
        <div className="input-container">
          <label htmlFor="starting-reps"> Reps </label>
          <input
            className="text"
            id="starting-reps"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="input-row border-bottom">
        <div className="input-container">
          <label htmlFor="starting-RPE"> RPE </label>
          <input
            className="text"
            id="starting-rpe"
            inputMode="numeric"
            pattern="[0-9\.]*"
          />
        </div>
      </div>

      <div className="subheader">
        <h2> Target Values</h2>
      </div>

      <div className="input-row">
        <div className="input-container">
          <label htmlFor="target-reps"> Reps </label>
          <input
            className="text"
            id="target-reps"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="input-row border-bottom">
        <div className="input-container">
          <label htmlFor="target-RPE"> RPE </label>
          <input
            className="text"
            id="target-rpe"
            inputMode="numeric"
            pattern="[0-9\.]*"
          />
        </div>
      </div>

      <div className="results">
        <div> Target weight: ...</div>
        <div> E1RM: ...</div>
      </div>
    </>
  )
}

export default App
