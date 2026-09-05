import {
  Button,
  Checkbox,
  NativeSelect,
  SegmentedControl,
  Stack,
} from '@mantine/core';
import { useEffect, useRef } from 'react';

import { PLATE_SIZES_KILOS, PLATE_SIZES_POUNDS } from './constants.ts';

type SettingsProps = {
  defaultCollars: boolean;
  defaultKiloPlates: number[];
  defaultKilos: boolean;
  defaultPoundPlates: number[];
  defaultRounding: number;
  handleClose: () => void;
  handleSetDefaultCollars: (value: boolean) => void;
  handleSetDefaultKiloPlates: (value: string[]) => void;
  handleSetDefaultKilos: (value: boolean) => void;
  handleSetDefaultPoundPlates: (value: string[]) => void;
  handleSetDefaultRounding: (value: number) => void;
  isActive: boolean;
};

const Settings = ({
  defaultCollars,
  defaultKiloPlates,
  defaultKilos,
  defaultPoundPlates,
  defaultRounding,
  handleClose,
  handleSetDefaultCollars,
  handleSetDefaultKiloPlates,
  handleSetDefaultKilos,
  handleSetDefaultPoundPlates,
  handleSetDefaultRounding,
  isActive,
}: SettingsProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isActive) {
      headingRef.current?.focus();
    }
  }, [isActive]);

  return (
    <>
      <div className='settings'>
        <h2 ref={headingRef} tabIndex={-1}>
          {' '}
          Defaults{' '}
        </h2>

        <div className='settings-explanation'>
          {' '}
          These are the settings that will bet set every time you open the
          application.
        </div>

        <div className='settings-defaults'>
          <div>
            <label
              className='label'
              id='collars-label'
              style={{ marginRight: '6px' }}
            >
              Collars
            </label>
            <SegmentedControl
              aria-labelledby='collars-label'
              color='#1568b0'
              size='xs'
              radius='xl'
              value={defaultCollars ? 'Collars' : 'None'}
              onChange={(value) => handleSetDefaultCollars(value === 'Collars')}
              data={[
                { value: 'Collars', label: 'Yes' },
                { value: 'None', label: 'None' },
              ]}
            />
          </div>

          <div>
            <label
              className='label'
              id='units-label'
              style={{ marginRight: '6px' }}
            >
              Units
            </label>
            <SegmentedControl
              aria-labelledby='units-label'
              color='#1568b0'
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

          <div>
            <label
              className='label'
              htmlFor='default-rounding'
              style={{ marginRight: '6px' }}
            >
              Rounding
            </label>
            <NativeSelect
              className='rounding'
              id='default-rounding'
              size='xs'
              name='rounding'
              onChange={(e) => {
                handleSetDefaultRounding(Number(e.target.value));
              }}
              value={defaultRounding}
            >
              <option value='5'> 5.0 </option>
              <option value='2.5'> 2.5 </option>
              <option value='1'> 1.0 </option>
              <option value='0.01'> 0.01 </option>
            </NativeSelect>
          </div>
        </div>

        <h2> Plate Choices </h2>

        <div>
          {' '}
          These are the plates that the plate loader will consider available.
          Select the plates that you have access to in your space.
        </div>

        <div className='plate-choices'>
          <Checkbox.Group
            label='Kilo plates'
            onChange={handleSetDefaultKiloPlates}
            value={defaultKiloPlates.map((plate: number) => `${plate}`)}
          >
            <Stack gap={'xs'}>
              {PLATE_SIZES_KILOS.map((plate) => (
                <Checkbox
                  key={plate}
                  className='checkbox kilos'
                  value={`${plate}`}
                  label={`${plate}`}
                />
              ))}
            </Stack>
          </Checkbox.Group>

          <Checkbox.Group
            label='Pound plates'
            onChange={handleSetDefaultPoundPlates}
            value={defaultPoundPlates.map((plate: number) => `${plate}`)}
          >
            <Stack gap={'xs'}>
              {PLATE_SIZES_POUNDS.map((plate) => (
                <Checkbox
                  key={plate}
                  className='checkbox pounds'
                  value={`${plate}`}
                  label={`${plate}`}
                />
              ))}
            </Stack>
          </Checkbox.Group>
        </div>
      </div>

      <div className='help-actions'>
        <Button className='help-close' color='#1779CE' onClick={handleClose}>
          Close settings
        </Button>
      </div>
    </>
  );
};

export default Settings;
