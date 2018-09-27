const RPEs = {
  "RPE": {
    "10": {
      "REPS": {
        "1":  1,
        "2":  .96,
        "3":  .92,
        "4":  .89,
        "5":  .86,
        "6":  .84,
        "7":  .81,
        "8":  .79,
        "9":  .76,
        "10": .74,
        "11": .71,
        "12": .69,
      }
    },
    "9": {
      "REPS": {
        "1":  .96,
        "2":  .92,
        "3":  .89,
        "4":  .86,
        "5":  .84,
        "6":  .81,
        "7":  .79,
        "8":  .76,
        "9":  .74,
        "10": .71,
        "11": .69,
        "12": .66,
      }
    },
    "8": {
      "REPS": {
        "1":  .92,
        "2":  .89,
        "3":  .86,
        "4":  .84,
        "5":  .81,
        "6":  .79,
        "7":  .76,
        "8":  .74,
        "9":  .71,
        "10": .68,
        "11": .66,
        "12": .63,
      }
    },
    "7": {
      "REPS": {
        "1":  .89,
        "2":  .86,
        "3":  .84,
        "4":  .81,
        "5":  .79,
        "6":  .76,
        "7":  .74,
        "8":  .71,
        "9":  .68,
        "10": .65,
        "11": .63,
        "12": .60,
      }
    },
    "6": {
      "REPS": {
        "1":  .86,
        "2":  .83,
        "3":  .80,
        "4":  .78,
        "5":  .75,
        "6":  .73,
        "7":  .70,
        "8":  .67,
        "9":  .65,
        "10": .62,
        "11": .60,
        "12": .57,
      },
    },
  },
};

function inputsEventHandler(e) {
  const desiredRPE = document.querySelector('input#desired-rpe').value;
  const desiredReps = document.querySelector('input#desired-reps').value;
  const givenRPE = document.querySelector('input#given-rpe').value;
  const givenReps = document.querySelector('input#given-reps').value;
  const givenWeight = document.querySelector('input#given-weight').value;

  if (!givenRPE || !givenReps || !givenWeight) {
    return false;
  }

  let errorText = "";
  if (givenRPE < 6) {
    errorText = "RPE too low";
  } else if (givenRPE > 10) {
    errorText = "RPE too high";
  } else if (givenWeight <= 0) {
    errorText = "Given weight too low";
  } else if (givenReps <= 0) {
    errorText = "Given reps too low";
  } else if (givenReps > 12) {
    errorText = "Sorry, this calculator only goes up to 12 reps";
  } else if (!`${givenRPE}`.match(/^[0-9]+$/g)) {
    errorText = "Given RPE is not a number";
  } else if (!`${givenWeight}`.match(/^[0-9]+$/g)) {
    errorText = "Given weight is not a number";
  } else if (!`${givenReps}`.match(/^[0-9]+$/g)) {
    errorText = "Given reps is not a number";
  }

  console.log(errorText);
  if (errorText.length > 0) {
    document.querySelector('#error').innerHTML = errorText;
    return false;
  }

  const enableDesiredInputs = givenWeight && givenRPE && givenReps;
  document.querySelector('input#desired-reps').disabled = !enableDesiredInputs;
  document.querySelector('input#desired-rpe').disabled = !enableDesiredInputs;

  if (enableDesiredInputs && desiredRPE && desiredReps) {
    const givenRPEDecimal = RPEs["RPE"][givenRPE]["REPS"][givenReps];
    const estimated1RM = givenWeight / givenRPEDecimal;
    const desiredRPEDecimal = RPEs["RPE"][desiredRPE]["REPS"][desiredReps];

    const desiredWeight = document.querySelector('#solved-weight');
    desiredWeight.innerHTML = parseInt(estimated1RM * desiredRPEDecimal);
  } else {
    desiredWeight.innerHTML = "...";
  }
}

document.querySelector('input#desired-reps').addEventListener('input', (e) => inputsEventHandler(e), false);
document.querySelector('input#desired-rpe').addEventListener('input', (e) => inputsEventHandler(e), false);
document.querySelector('input#given-reps').addEventListener('input', (e) => inputsEventHandler(e), false);
document.querySelector('input#given-rpe').addEventListener('input', (e) => inputsEventHandler(e), false);
document.querySelector('input#given-weight').addEventListener('input', (e) => inputsEventHandler(e), false);
