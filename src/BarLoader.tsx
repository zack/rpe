type BarLoaderProps = {
  actualWeight: number;
  barWeight: string;
  plates: number[];
  setBarWeight: React.Dispatch<React.SetStateAction<string>>;
  usingCollars: boolean;
  usingKilos: boolean;
}
const BarLoader = ({
  actualWeight,
  barWeight,
  plates,
  setBarWeight,
  usingCollars,
  usingKilos,
}: BarLoaderProps ) => {
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
    </
    >
  );
}

export default BarLoader;
