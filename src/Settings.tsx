import {
  PLATE_SIZES_KILOS,
  PLATE_SIZES_POUNDS
} from './constants.ts';

import {
  Button,
  Checkbox,
  SegmentedControl,
  Stack,
} from '@mantine/core';


type SettingsProps = {
  defaultCollars: boolean;
  defaultKiloPlates: number[];
  defaultKilos: boolean;
  defaultPoundPlates: number[];
  handleClose: () => void;
  handleSetDefaultCollars: (value: boolean) => void,
  handleSetDefaultKiloPlates: (value: string[]) => void,
  handleSetDefaultKilos: (value: boolean) => void,
  handleSetDefaultPoundPlates: (value: string[]) => void,
}

const Settings = ({
  defaultCollars,
  defaultKiloPlates,
  defaultKilos,
  defaultPoundPlates,
  handleClose,
  handleSetDefaultCollars,
  handleSetDefaultKiloPlates,
  handleSetDefaultKilos,
  handleSetDefaultPoundPlates,
} : SettingsProps) => {
  return (
    <>
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
        <Button className="help-close" onClick={handleClose}> Close settings </Button>
      </div>
    </>
  );
};

export default Settings;
