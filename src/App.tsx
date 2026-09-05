// Required for other components
import '@mantine/core/styles/CloseButton.css';
import '@mantine/core/styles/FloatingIndicator.css';
import '@mantine/core/styles/InlineInput.css';
import '@mantine/core/styles/Input.css';
import '@mantine/core/styles/ModalBase.css';
import '@mantine/core/styles/Overlay.css';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/UnstyledButton.css';
// For components that are actually used directly
import '@mantine/core/styles/ActionIcon.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Checkbox.css';
import '@mantine/core/styles/Modal.css';
import '@mantine/core/styles/SegmentedControl.css';
import '@mantine/core/styles/Stack.css';
// Needs to go after the mantine CSS imports
import './App.css';
import { ActionIcon, Button, Modal, SegmentedControl } from '@mantine/core';
import {
  IconBrandGithubFilled,
  IconHelpCircleFilled,
  IconSettingsFilled,
} from '@tabler/icons-react';
import { Activity, useRef, useState } from 'react';

import BarLoader from './BarLoader';
import {
  DEFAULT_ROUNDING,
  PLATE_SIZES_KILOS,
  PLATE_SIZES_POUNDS,
} from './constants.ts';
import Help from './Help';
import Settings from './Settings';

const YEAR = new Date().getFullYear();

// Views
const View = {
  DEFAULT: 'default',
  HELP: 'help',
  SETTINGS: 'settings',
} as const;
type View = (typeof View)[keyof typeof View];

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
  plateSizes: number[],
  usingCollars: boolean,
  usingKilos: boolean,
  weight: number | false,
): { plates: number[]; actualWeight: number } {
  if (!weight) {
    return { plates: [], actualWeight: 0 };
  }

  const barWeight = usingKilos ? 20 : 45;
  const collarWeight = usingCollars ? (usingKilos ? 5 : 11) : 0;
  let remainingWeight = weight - barWeight - collarWeight;
  let actualWeight = barWeight + collarWeight;

  const largestPossiblePlate = (
    remainingWeight: number,
  ): number | undefined => {
    return plateSizes
      .sort((a, b) => b - a)
      .find((plate) => plate * 2 <= remainingWeight);
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
  const [view, setView] = useState<View>(View.DEFAULT);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [showModal, setShowModal] = useState(
    () => window.localStorage.getItem('modal-dismissed') !== 'true',
  );

  const [startingWeight, setStartingWeight] = useState('');
  const [startingReps, setStartingReps] = useState(0);
  const [startingRPE, setStartingRPE] = useState('');

  const [targetReps, setTargetReps] = useState(0);
  const [targetRPE, setTargetRPE] = useState('');

  const [startingRPEFocused, setStartingRPEFocused] = useState(false);
  const [targetRPEFocused, setTargetRPEFocused] = useState(false);

  const [rounding, setRounding] = useState(() =>
    Number(window.localStorage.getItem('rounding') ?? `${DEFAULT_ROUNDING}`),
  );

  const [e1RMMultiplier, setE1RMMultiplier] = useState('100');

  const [usingCollars, setUsingCollars] = useState(
    () => window.localStorage.getItem('collars') === 'true',
  );
  const [usingKilos, setUsingKilos] = useState(
    () => window.localStorage.getItem('kilos') === 'true',
  );

  const [barWeight, setBarWeight] = useState('');
  const [overrideBarWeight, setOverrideBarWeight] = useState(false);
  const [barWeightToE1RM, setBarWeightToE1RM] = useState(false);

  const [defaultCollars, setDefaultCollars] = useState(
    () => window.localStorage.getItem('collars') === 'true',
  );
  const [defaultKilos, setDefaultKilos] = useState(
    () => window.localStorage.getItem('kilos') === 'true',
  );

  const [defaultKiloPlates, setDefaultKiloPlates] = useState(() =>
    JSON.parse(
      window.localStorage.getItem('plates-kilos')
        || JSON.stringify(PLATE_SIZES_KILOS),
    ),
  );
  const [defaultPoundPlates, setDefaultPoundPlates] = useState(() =>
    JSON.parse(
      window.localStorage.getItem('plates-pounds')
        || JSON.stringify(PLATE_SIZES_POUNDS),
    ),
  );

  const [defaultRounding, setDefaultRounding] = useState(() =>
    Number(
      JSON.parse(
        window.localStorage.getItem('rounding')
          ?? JSON.stringify(DEFAULT_ROUNDING),
      ),
    ),
  );

  const startingWeightNum = Number(startingWeight);
  const startingRPENum = Number(startingRPE);
  const targetRPENum = Number(targetRPE);
  const e1RMMultiplierNum = Number(e1RMMultiplier);
  const barWeightNum = Number(barWeight);

  function handleSetDefaultCollars(value: boolean) {
    setDefaultCollars(value);
    window.localStorage.setItem('collars', value ? 'true' : 'false');
  }

  function handleSetDefaultKilos(value: boolean) {
    setDefaultKilos(value);
    window.localStorage.setItem('kilos', value ? 'true' : 'false');
  }

  function handleSetDefaultKiloPlates(values: string[]) {
    const arr = values.map((v) => Number(v));
    setDefaultKiloPlates(arr);
    window.localStorage.setItem('plates-kilos', JSON.stringify(arr));
  }

  function handleSetDefaultPoundPlates(values: string[]) {
    const arr = values.map((v) => Number(v));
    setDefaultPoundPlates(arr);
    window.localStorage.setItem('plates-pounds', JSON.stringify(arr));
  }

  function handleSetDefaultRounding(value: number) {
    setDefaultRounding(value);
    window.localStorage.setItem('rounding', `${value}`);
  }

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
    usingKilos ? defaultKiloPlates : defaultPoundPlates,
    usingCollars,
    usingKilos,
    barWeightNum,
  );

  return (
    <>
      <Modal
        opened={showModal}
        title='Hello!'
        centered
        onClose={() => {
          setShowModal(false);
          window.localStorage.setItem('modal-dismissed', 'true');
        }}
      >
        <div className='modal-section'>
          Thank you for using this calculator! There are some{' '}
          <b>new features</b> you should know about.
        </div>

        <div className='modal-section'>
          If you click on the settings button (the gear icon) in the bottom
          right, you can now customize what plates the loader will use and
          whether to use kilos or pounds and collars.{' '}
          <b>These settings will be saved in your browser for next time.</b>
        </div>

        <div className='modal-section'>
          Feel free to reach out with any bugs or suggestions! Check the new
          help section by clicking the question mark icon in the bottom right
          for details.
        </div>

        <div className='modal-close'>
          <Button
            onClick={() => {
              setShowModal(false);
              window.localStorage.setItem('modal-dismissed', 'true');
            }}
          >
            Close forever
          </Button>
        </div>
      </Modal>

      <header className='header'>
        <h1>RPE Calculator</h1>
      </header>

      <main>
        <Activity mode={view === View.HELP ? 'visible' : 'hidden'}>
          <Help
            isActive={view === View.HELP}
            handleClose={() => {
              setView(View.DEFAULT);
              helpButtonRef.current?.focus();
            }}
          />
        </Activity>

        <Activity mode={view === View.SETTINGS ? 'visible' : 'hidden'}>
          <Settings
            defaultCollars={defaultCollars}
            defaultKiloPlates={defaultKiloPlates}
            defaultKilos={defaultKilos}
            defaultPoundPlates={defaultPoundPlates}
            defaultRounding={defaultRounding}
            isActive={view === View.SETTINGS}
            handleClose={() => {
              setView(View.DEFAULT);
              settingsButtonRef.current?.focus();
            }}
            handleSetDefaultCollars={handleSetDefaultCollars}
            handleSetDefaultKiloPlates={handleSetDefaultKiloPlates}
            handleSetDefaultKilos={handleSetDefaultKilos}
            handleSetDefaultPoundPlates={handleSetDefaultPoundPlates}
            handleSetDefaultRounding={handleSetDefaultRounding}
          />
        </Activity>

        <Activity mode={view === View.DEFAULT ? 'visible' : 'hidden'}>
          <div className='subheader'>
            <h2>Starting Values</h2>
          </div>

          <div className={`input-row ${errors.startingWeight && 'error'}`}>
            <div className='input-container'>
              <label htmlFor='starting-weight'>Weight</label>

              <input
                aria-describedby='starting-weight-error'
                aria-invalid={!!errors.startingWeight}
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

            <div className='error' id='starting-weight-error'>
              {errors.startingWeight}
            </div>
          </div>

          <div className={`input-row ${errors.startingReps && 'error'}`}>
            <div className='input-container'>
              <label htmlFor='starting-reps'>Reps</label>

              <input
                aria-describedby='starting-reps-error'
                aria-invalid={!!errors.startingReps}
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

            <div className='error' id='starting-reps-error'>
              {errors.startingReps}
            </div>
          </div>

          <div
            className={`input-row border-bottom ${errors.startingRPE && 'error'}`}
          >
            <div className='input-container'>
              <label htmlFor='starting-rpe'>RPE</label>

              <input
                aria-describedby='starting-rpe-error'
                aria-invalid={!!errors.startingRPE}
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

            <div className='error' id='starting-rpe-error'>
              {errors.startingRPE}
            </div>
          </div>

          <div className='subheader'>
            <h2>Target Values</h2>
          </div>

          <div className={`input-row ${errors.targetReps && 'error'}`}>
            <div className='input-container'>
              <label htmlFor='target-reps'>Reps</label>

              <input
                aria-describedby='target-reps-error'
                aria-invalid={!!errors.targetReps}
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

            <div className='error' id='target-reps-error'>
              {errors.targetReps}
            </div>
          </div>

          <div className={`input-row ${errors.targetRPE && 'error'}`}>
            <div className='input-container'>
              <label htmlFor='target-rpe'>RPE</label>

              <input
                aria-describedby='target-rpe-error'
                aria-invalid={!!errors.targetRPE}
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

            <div className='error' id='target-rpe-error'>
              {errors.targetRPE}
            </div>
          </div>

          <div className='options one'>
            <label
              className='rounding'
              htmlFor='rounding'
              style={{ marginRight: '6px' }}
            >
              Target Weight Rounding:
            </label>
            <select
              className='rounding'
              id='rounding'
              name='rounding'
              onChange={(e) => {
                setRounding(Number(e.target.value));
                setOverrideBarWeight(true);
              }}
              style={{ paddingLeft: '14px' }}
              value={rounding}
            >
              <option value='5'>5.0</option>
              <option value='2.5'>2.5</option>
              <option value='1'>1.0</option>
              <option value='0.01'>0.01</option>
            </select>
          </div>

          <div aria-atomic='true' className='results' role='status'>
            <div className='target'>
              Target weight:{' '}
              {showTargetWeight ? targetWeight.toFixed(2) : '...'}
            </div>
            <div className='e1rm'>
              E1RM: {showE1RM ? e1RM.toFixed(2) : '...'} x{' '}
              <input
                className='e1rm-multiplier text'
                aria-label='Estimated 1 rep max multiplier'
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
              aria-label='Collars'
              color='#1568b0'
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
              aria-label='Units'
              color='#1568b0'
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

          <BarLoader
            actualWeight={actualWeight}
            barWeight={barWeight}
            plates={plates}
            setBarWeight={setBarWeight}
            usingCollars={usingCollars}
            usingKilos={usingKilos}
          />
        </Activity>
      </main>

      <footer className='footer'>
        <div className='footer-inner'>
          <div className='attribution'>© {YEAR} Zack Youngren</div>

          <div>
            <ActionIcon
              component='a'
              href='https://github.com/zack/rpe'
              variant='filled'
              radius='xl'
              aria-label='View source on GitHub'
            >
              <IconBrandGithubFilled />
            </ActionIcon>

            <ActionIcon
              aria-label='Help'
              onClick={() =>
                setView(view === View.HELP ? View.DEFAULT : View.HELP)
              }
              radius='xl'
              ref={helpButtonRef}
              variant={view === View.HELP ? 'white' : 'filled'}
            >
              <IconHelpCircleFilled />
            </ActionIcon>

            <ActionIcon
              aria-label='Settings'
              onClick={() =>
                setView(view === View.SETTINGS ? View.DEFAULT : View.SETTINGS)
              }
              radius='xl'
              ref={settingsButtonRef}
              variant={view === View.SETTINGS ? 'white' : 'filled'}
            >
              <IconSettingsFilled />
            </ActionIcon>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
