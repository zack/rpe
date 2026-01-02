import {
  Button,
} from '@mantine/core';

const Help = ({ handleClose } : { handleClose: () => void }) => {
  return (
    <>
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
        <Button className="help-close" onClick={handleClose}> Close this help </Button>
      </div>
    </>
  );
};

export default Help;
