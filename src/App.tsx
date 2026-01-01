import { useState } from 'react';
import { SegmentedControl } from '@mantine/core';

import '@mantine/core/styles/FloatingIndicator.css';
import '@mantine/core/styles/SegmentedControl.css';

import './App.css';

const YEAR = new Date().getFullYear();

type RPE = 5 | 6 | 7 | 8 | 9 | 10;

// These functions are derived from linear regressions of the RPE chart data
// used in my rpe Elm calculator at  github.com/zack/rpe-elm.git
const RPE_FUNCTIONS = {
  5: (x: number) => -0.0261 * (x - 1) + 0.828,
  6: (x: number) => -0.026 * (x - 1) + 0.856,
  7: (x: number) => -0.0262 * (x - 1) + 0.891,
  8: (x: number) => -0.0259 * (x - 1) + 0.917,
  9: (x: number) => -0.0262 * (x - 1) + 0.947,
  10: (x: number) => -0.0277 * (x - 1) + 0.993,
};

function getPlates(
  weight: number | false,
  usingCollars: boolean,
  usingKilos: boolean,
): { plates: number[]; actualWeight: number } {
  if (!weight) {
    return { plates: [], actualWeight: 0 };
  }

  const barWeight = usingKilos ? 20 : 45;
  const collarWeight = usingCollars ? (usingKilos ? 5 : 11) : 0;
  let remainingWeight = weight - barWeight - collarWeight;
  let actualWeight = barWeight + collarWeight;

  const plateSizes = usingKilos
    ? [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]
    : [45, 35, 25, 10, 5, 2.5, 1.25];

  const largestPossiblePlate = (
    remainingWeight: number,
  ): number | undefined => {
    return plateSizes.find((plate) => plate * 2 <= remainingWeight);
  };

  const plates: number[] = [];

  while (largestPossiblePlate(remainingWeight) !== undefined) {
    const nextPlate = largestPossiblePlate(remainingWeight) as number;
    plates.push(nextPlate);
    remainingWeight -= 2 * nextPlate;
    actualWeight += 2 * nextPlate;
  }

  return { plates, actualWeight };
}

function roundTo(value: number, rounding: number): number {
  return Math.round(value / rounding) * rounding;
}

const getRPECoefficient = (reps: number, rpe: number) => {
  // The new functions aren't perfect here due to a greater falloff
  // at high reps at 10RPE. Clamp this to 1 for nicer nubmers.
  if (rpe === 10 && reps === 1) {
    return 1;
  }

  const lowerRPEValue = RPE_FUNCTIONS[Math.floor(rpe) as RPE](reps);
  const upperRPEValue = RPE_FUNCTIONS[Math.ceil(rpe) as RPE](reps);

  return lowerRPEValue + (upperRPEValue - lowerRPEValue) * (rpe % 1);
};

function App() {
  const [startingWeight, setStartingWeight] = useState('');
  const [startingReps, setStartingReps] = useState(0);
  const [startingRPE, setStartingRPE] = useState('');

  const [targetReps, setTargetReps] = useState(0);
  const [targetRPE, setTargetRPE] = useState('');

  const [startingRPEFocused, setStartingRPEFocused] = useState(false);
  const [targetRPEFocused, setTargetRPEFocused] = useState(false);

  const [rounding, setRounding] = useState(5);

  const [e1RMMultiplier, setE1RMMultiplier] = useState('100');

  const [usingCollars, setUsingCollars] = useState(true);
  const [usingKilos, setUsingKilos] = useState(true);

  const [barWeight, setBarWeight] = useState('');
  const [overrideBarWeight, setOverrideBarWeight] = useState(false);
  const [barWeightToE1RM, setBarWeightToE1RM] = useState(false);

  const startingWeightNum = Number(startingWeight);
  const startingRPENum = Number(startingRPE);
  const targetRPENum = Number(targetRPE);
  const e1RMMultiplierNum = Number(e1RMMultiplier);
  const barWeightNum = Number(barWeight);

  const errors = {
    startingWeight: '',
    startingReps: '',
    startingRPE: '',
    targetReps: '',
    targetRPE: '',
  };

  if (startingWeight && isNaN(startingWeightNum)) {
    errors.startingWeight = 'Weight must be a number';
  } else if (startingWeight && Number(startingWeight) < 0) {
    errors.startingWeight = 'Weight must be greater than 0';
  }

  if (startingReps && startingReps < 0) {
    errors.startingReps = 'Reps must be a positive number';
  }

  if (
    startingRPENum
    && !(startingRPEFocused && startingRPENum === 1)
    && (startingRPENum < 5 || startingRPENum > 10)
  ) {
    errors.startingRPE = 'RPE must be between 5 and 10';
  }

  if (targetReps && targetReps < 0) {
    errors.targetReps = 'Reps must be a positive number';
  }

  if (
    targetRPENum
    && !(targetRPEFocused && targetRPENum === 1)
    && (targetRPENum < 5 || targetRPENum > 10)
  ) {
    errors.targetRPE = 'RPE must be between 5 and 10';
  }

  const e1RM =
    startingWeightNum
    && !errors.startingWeight
    && startingReps
    && !errors.startingReps
    && startingRPENum
    && startingRPENum > 1
    && !errors.startingRPE
    && startingWeightNum / getRPECoefficient(startingReps, startingRPENum);

  if (e1RM && e1RM < 0) {
    errors.startingReps = 'Reps too high';
  }

  const showE1RM = !errors.startingReps && e1RM;

  const targetWeight =
    e1RM
    && targetReps
    && !errors.targetReps
    && targetRPENum
    && targetRPENum > 1
    && !errors.targetRPE
    && roundTo(e1RM * getRPECoefficient(targetReps, targetRPENum), rounding);

  if (overrideBarWeight && targetWeight) {
    setBarWeight(targetWeight.toFixed(2));
    setOverrideBarWeight(false);
  }

  if (barWeightToE1RM && e1RM) {
    setBarWeightToE1RM(false);
    setBarWeight((e1RM * (e1RMMultiplierNum / 100)).toFixed(2));
  }

  if (showE1RM && targetWeight && targetWeight < 0) {
    errors.targetReps = 'Reps too high';
  }

  const showTargetWeight = !errors.targetReps && targetWeight;

  const { plates, actualWeight } = getPlates(
    barWeightNum,
    usingCollars,
    usingKilos,
  );

  let actualBarWeight;
  if (usingKilos && usingCollars) {
    actualBarWeight = Math.max(25, actualWeight);
  } else if (usingKilos) {
    actualBarWeight = Math.max(20, actualWeight);
  } else if (usingCollars) {
    actualBarWeight = Math.max(56, actualWeight);
  } else {
    actualBarWeight = Math.max(45, actualWeight);
  }

  return (
    <>
      <div className='header'>
        <h1> RPE Calculator </h1>
      </div>

      <div className='subheader'>
        <h2> Starting Values</h2>
      </div>

      <div className={`input-row ${errors.startingWeight && 'error'}`}>
        <div className='input-container'>
          <label htmlFor='starting-weight'> Weight </label>

          <input
            className='text'
            id='starting-weight'
            inputMode='decimal'
            onChange={(e) => {
              setStartingWeight(e.target.value.replace(/[^0-9.]/g, ''));
              setOverrideBarWeight(true);
            }}
            type='text'
            value={startingWeight ? startingWeight : ''}
          />
        </div>

        <div className='error'>{errors.startingWeight}</div>
      </div>

      <div className={`input-row ${errors.startingReps && 'error'}`}>
        <div className='input-container'>
          <label htmlFor='starting-reps'> Reps </label>

          <input
            className='text'
            id='starting-reps'
            inputMode='decimal'
            onChange={(e) => {
              setStartingReps(Number(e.target.value));
              setOverrideBarWeight(true);
            }}
            value={startingReps ? startingReps : ''}
          />
        </div>

        <div className='error'>{errors.startingReps}</div>
      </div>

      <div
        className={`input-row border-bottom ${errors.startingRPE && 'error'}`}
      >
        <div className='input-container'>
          <label htmlFor='starting-RPE'> RPE </label>

          <input
            className='text'
            id='starting-rpe'
            inputMode='decimal'
            onBlur={() => setStartingRPEFocused(false)}
            onChange={(e) => {
              setStartingRPE(e.target.value.replace(/[^0-9.]/g, ''));
              setOverrideBarWeight(true);
            }}
            onFocus={() => setStartingRPEFocused(true)}
            value={startingRPENum ? startingRPE : ''}
          />
        </div>

        <div className='error'>{errors.startingRPE}</div>
      </div>

      <div className='subheader'>
        <h2> Target Values</h2>
      </div>

      <div className={`input-row ${errors.targetReps && 'error'}`}>
        <div className='input-container'>
          <label htmlFor='target-reps'> Reps </label>

          <input
            className='text'
            id='target-reps'
            inputMode='decimal'
            onChange={(e) => {
              setTargetReps(Number(e.target.value));
              setOverrideBarWeight(true);
            }}
            value={targetReps ? targetReps : ''}
          />
        </div>

        <div className='error'>{errors.targetReps}</div>
      </div>

      <div className={`input-row ${errors.targetRPE && 'error'}`}>
        <div className='input-container'>
          <label htmlFor='target-RPE'> RPE </label>

          <input
            className='text'
            id='target-rpe'
            inputMode='decimal'
            onBlur={() => setTargetRPEFocused(false)}
            onChange={(e) => {
              setTargetRPE(e.target.value.replace(/[^0-9.]/g, ''));
              setOverrideBarWeight(true);
            }}
            onFocus={() => setTargetRPEFocused(true)}
            value={targetRPE ? targetRPE : ''}
          />
        </div>

        <div className='error'>{errors.targetRPE}</div>
      </div>

      <div className='options one'>
        <label
          className='rounding'
          htmlFor='rounding'
          style={{ marginRight: '6px' }}
        >
          {' '}
          Target Weight Rounding:{' '}
        </label>
        <select
          className='rounding'
          id='rounding'
          name='rounding'
          onChange={(e) => { setRounding(Number(e.target.value)); setOverrideBarWeight(true); }}
          style={{ paddingLeft: '14px' }}
        >
          <option value='5'> 5.0 </option>
          <option value='2.5'> 2.5 </option>
          <option value='1'> 1.0 </option>
          <option value='0.01'> 0.01 </option>
        </select>
      </div>

      <div className='results'>
        <div className='target'>
          {' '}
          Target weight: {showTargetWeight
            ? targetWeight.toFixed(2)
            : '...'}{' '}
        </div>
        <div className='e1rm'>
          E1RM: {showE1RM ? e1RM.toFixed(2) : '...'} x{' '}
          <input
            className='e1rm-multiplier text'
            inputMode='decimal'
            maxLength={3}
            onChange={(e) => {
              setE1RMMultiplier(e.target.value.replace(/[^0-9.]/g, ''));
              setBarWeightToE1RM(true);
            }}
            value={e1RMMultiplierNum ? e1RMMultiplierNum : ''}
          />
          <div className='e1rm-percent'>%</div>={' '}
          {showE1RM ? (e1RM * (e1RMMultiplierNum / 100)).toFixed(2) : '...'}
        </div>
      </div>

      <div className='options two'>
        <SegmentedControl
          color='blue'
          size='xs'
          radius='xl'
          value={usingCollars ? 'Collars' : 'None'}
          onChange={(value) => setUsingCollars(value === 'Collars')}
          data={[
            { value: 'Collars', label: 'Collars' },
            { value: 'None', label: 'None' },
          ]}
        />

        <SegmentedControl
          color='blue'
          size='xs'
          radius='xl'
          value={usingKilos ? 'Kilos' : 'Pounds'}
          onChange={(value) => setUsingKilos(value === 'Kilos')}
          data={[
            { value: 'Kilos', label: 'Kilos' },
            { value: 'Pounds', label: 'Pounds' },
          ]}
        />
      </div>

      <div className='bar-loader'>
        <div className='bar-weight-container'>
          <input
            className='bar-weight'
            id='bar-weight'
            inputMode='decimal'
            onChange={(e) => {
              setBarWeight(e.target.value.replace(/[^0-9.]/g, ''));
            }}
            onBlur={() =>
              setBarWeight(barWeight ? Number(barWeight).toFixed(2) : '')
            }
            type='text'
            value={barWeight ? barWeight : ''}
          />
          <div className='bar-weight-unit'>{usingKilos ? 'kg' : 'lb'}</div>
        </div>

        <div className='bar-container'>
          <div className='bar left' />
          <div className='bar left2' />
          <div className='plates'>
            {plates.map((plate: number, index) => (
              <div
                key={index}
                className={`plate ${usingKilos ? 'k' : 'l'}${plate.toString().replace('.', 'p')}`}
              >
                {plate}
              </div>
            ))}
          </div>
          {usingCollars && <div className='collar' />}
          <div className='bar right' />
        </div>

        <div className='actual-bar-weight'>
          ({actualBarWeight}
          {usingKilos ? ' kg' : ' lbs'})
        </div>
      </div>

      <div className='bar-disclaimer'>
        Not all weights can be made. Bar loader will always round down to the
        next possible weight.
      </div>

      <div className='footer'>
        <div>© {YEAR} Zack Youngren</div>
        <div>
          Code on <a href='https://www.github.com/zack/rpe'> GitHub </a>
        </div>
      </div>
    </>
  );
}

export default App;
