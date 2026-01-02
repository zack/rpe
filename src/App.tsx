import { Activity, useState } from 'react';
import {
  ActionIcon,
  Button,
  Checkbox,
  SegmentedControl,
  Stack,
} from '@mantine/core';
import { IconBrandGithubFilled, IconHelpCircleFilled, IconSettingsFilled } from '@tabler/icons-react';

// Required for other components
import '@mantine/core/styles/FloatingIndicator.css';
import '@mantine/core/styles/InlineInput.css';
import '@mantine/core/styles/Input.css';
import '@mantine/core/styles/UnstyledButton.css';

// For components that are actually used directly
import '@mantine/core/styles/ActionIcon.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Checkbox.css';
import '@mantine/core/styles/SegmentedControl.css';
import '@mantine/core/styles/Stack.css';

// Needs to go after the mantine CSS imports
import './App.css';

const YEAR = new Date().getFullYear();

// Views
const View = {
  DEFAULT: 'default',
  HELP: 'help',
  SETTINGS: 'settings',
} as const;
type View = (typeof View)[keyof typeof View];

// Plate size options
const PLATE_SIZES_KILOS = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25];
const PLATE_SIZES_POUNDS = [55, 45, 35, 25, 10, 5, 2.5, 1.25, 0.5];

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
    return plateSizes.sort((a,b) => b-a).find((plate) => plate * 2 <= remainingWeight);
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

  const [startingWeight, setStartingWeight] = useState('');
  const [startingReps, setStartingReps] = useState(0);
  const [startingRPE, setStartingRPE] = useState('');

  const [targetReps, setTargetReps] = useState(0);
  const [targetRPE, setTargetRPE] = useState('');

  const [startingRPEFocused, setStartingRPEFocused] = useState(false);
  const [targetRPEFocused, setTargetRPEFocused] = useState(false);

  const [rounding, setRounding] = useState(5);

  const [e1RMMultiplier, setE1RMMultiplier] = useState('100');

  const [usingCollars, setUsingCollars] = useState(() => window.localStorage.getItem('collars') === 'true');
  const [usingKilos, setUsingKilos] = useState((() => window.localStorage.getItem('kilos') === 'true'));

  const [barWeight, setBarWeight] = useState('');
  const [overrideBarWeight, setOverrideBarWeight] = useState(false);
  const [barWeightToE1RM, setBarWeightToE1RM] = useState(false);

  const [defaultCollars, setDefaultCollars] = useState(() => window.localStorage.getItem('collars') === 'true');
  const [defaultKilos, setDefaultKilos] = useState(() => window.localStorage.getItem('kilos') === 'true');

  const [defaultKiloPlates, setDefaultKiloPlates] = useState(() => JSON.parse(window.localStorage.getItem('plates-kilos') || JSON.stringify(PLATE_SIZES_KILOS)));
  const [defaultPoundPlates, setDefaultPoundPlates] = useState(() => JSON.parse(window.localStorage.getItem('plates-pounds') || JSON.stringify(PLATE_SIZES_POUNDS)));

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

  console.log({ plates });

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

      <Activity mode={view === View.HELP ? 'visible' : 'hidden'}>
        <div className="help-content">
          <h2>How do I use this tool?</h2>
          <ul>
            <li> Input the weight, reps, and your RPE for a given set.</li>
            <li> Input your desired reps and RPE for your next set.</li>
            <li> The calculator will output the recommended weight for your next set based on the provided inputs.</li>
            <li> Don't take the nubmer as gospel. Everyone is different and every day is different. It's just a helpful starting place.</li>
            <li> The calculations are unit-agnostic, so you can use either pounds or kilograms.</li>
            <li> The bar loader will show you how to load the bar for that weight, given your choice of collars and units.</li>
          </ul>
          <h2>What is "RPE"?</h2>
          <ul>
            <li> RPE stands for "Rate of Perceived Exertion" and is a measurement of exertion used to gauge the intensity of an exercise.</li>
            <li> A set at RPE 10 means you could not perform any more reps.</li>
            <li> A set at RPE 9 means you could perform 1 more rep.</li>
            <li> A set at RPE 8 means you could perform 2 more reps, etc.</li>
          </ul>
          <h2>Where do the numbers come from?</h2>
          <ul>
            <li> A chart on the wall of my old gym, slightly modified to be a linear scale.</li>
          </ul>
          <h2>Feedback</h2>
          <ul>
            <li> Notice a bug or have a request? Feel free to email me at rpe [at] youngren.io or <a href="https://github.com/zack/rpe/issues/new">open an issue on GitHub</a></li>
          </ul>
        </div>

        <div className="help-actions">
          <Button className="help-close" onClick={ () => setView(View.DEFAULT) }> Close this help </Button>
        </div>
      </Activity>

      <Activity mode={view === View.SETTINGS ? 'visible' : 'hidden'}>
        <div className="settings">
          <h2> Defaults </h2>

          <div className="settings-explanation"> These are the settings that will bet set every time you open the application.</div>

          <div className="settings-defaults">
            <div>
              <b>Collars:{' '}</b>
              <SegmentedControl
                color='blue'
                size='xs'
                radius='xl'
                value={defaultCollars ? 'Collars' : 'None'}
                onChange={(value) => handleSetDefaultCollars(value === 'Collars')}
                data={[
                  { value: 'Collars', label: 'Collars' },
                { value: 'None', label: 'None' },
                ]}
              />
            </div>

            <div>
              <b>Units:{' '}</b>
              <SegmentedControl
                color='blue'
                size='xs'
                radius='xl'
                value={defaultKilos ? 'Kilos' : 'Pounds'}
                onChange={(value) => handleSetDefaultKilos(value === 'Kilos')}
                data={[
                  { value: 'Kilos', label: 'Kilos' },
                { value: 'Pounds', label: 'Pounds' },
                ]}
              />
            </div>
          </div>

          <h2> Plate Choices </h2>

          <div> These are the plates that the plate loader will consider available. Select the plates that you have access to in your space.</div>

          <div className="plate-choices">
            <Checkbox.Group
              label="Kilo plates"
              onChange={handleSetDefaultKiloPlates}
              value={defaultKiloPlates.map((plate: number) => `${plate}`)}
            >
              <Stack gap={'xs'}>
                {PLATE_SIZES_KILOS.map((plate) => (
                  <Checkbox key={plate} className='checkbox kilos' value={`${plate}`} label={`${plate}`} />
                ))}
              </Stack>
            </Checkbox.Group>

            <Checkbox.Group
              label="Pound plates"
              onChange={handleSetDefaultPoundPlates}
              value={defaultPoundPlates.map((plate: number) => `${plate}`)}
            >
              <Stack gap={'xs'}>
                {PLATE_SIZES_POUNDS.map((plate) => (
                  <Checkbox key={plate} className='checkbox pounds' value={`${plate}`} label={`${plate}`} />
                ))}
              </Stack>
            </Checkbox.Group>

          </div>
        </div>

        <div className="help-actions">
          <Button className="help-close" onClick={ () => setView(View.DEFAULT) }> Close settings </Button>
        </div>
      </Activity>

      <Activity mode={ view === View.DEFAULT ? 'visible' : 'hidden'}>
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
      </Activity>

      <div className='footer'>
        <div className='footer-inner'>
          <div className='attribution'>
            © {YEAR} Zack Youngren
          </div>

          <div>
            <ActionIcon
              component="a"
              href="https://github.com/zack/rpe"
              variant="filled"
              radius="xl"
              aria-label="Help"

            >
              <IconBrandGithubFilled />
            </ActionIcon>

            <ActionIcon
              aria-label="Help"
              onClick={ () => setView(view === View.HELP ? View.DEFAULT : View.HELP) }
              radius="xl"
              variant={ view === View.HELP ? "white" : "filled" }
            >
              <IconHelpCircleFilled/>
            </ActionIcon>

            <ActionIcon
              aria-label="Settings"
              onClick={ () => setView(view === View.SETTINGS ? View.DEFAULT : View.SETTINGS) }
              radius="xl"
              variant={ view === View.SETTINGS ? "white" : "filled" }

            >
              <IconSettingsFilled />
            </ActionIcon>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
