(function() {

  interface RepValues {
    [reps: string]: number
  }

  interface RPEChart {
    "RPE": {
      [rpeValue:string]: {
        "REPS": RepValues
      }
    }
  }

  const RPEs: RPEChart = {
    RPE: {
      "10": {
        REPS: {
          "1": 1,
          "2": 0.96,
          "3": 0.92,
          "4": 0.89,
          "5": 0.86,
          "6": 0.84,
          "7": 0.81,
          "8": 0.79,
          "9": 0.76,
          "10": 0.74,
          "11": 0.71,
          "12": 0.69
        }
      },
      "9": {
        REPS: {
          "1": 0.96,
          "2": 0.92,
          "3": 0.89,
          "4": 0.86,
          "5": 0.84,
          "6": 0.81,
          "7": 0.79,
          "8": 0.76,
          "9": 0.74,
          "10": 0.71,
          "11": 0.69,
          "12": 0.66
        }
      },
      "8": {
        REPS: {
          "1": 0.92,
          "2": 0.89,
          "3": 0.86,
          "4": 0.84,
          "5": 0.81,
          "6": 0.79,
          "7": 0.76,
          "8": 0.74,
          "9": 0.71,
          "10": 0.68,
          "11": 0.66,
          "12": 0.63
        }
      },
      "7": {
        REPS: {
          "1": 0.89,
          "2": 0.86,
          "3": 0.84,
          "4": 0.81,
          "5": 0.79,
          "6": 0.76,
          "7": 0.74,
          "8": 0.71,
          "9": 0.68,
          "10": 0.65,
          "11": 0.63,
          "12": 0.6
        }
      },
      "6": {
        REPS: {
          "1": 0.86,
          "2": 0.83,
          "3": 0.8,
          "4": 0.78,
          "5": 0.75,
          "6": 0.73,
          "7": 0.7,
          "8": 0.67,
          "9": 0.65,
          "10": 0.62,
          "11": 0.6,
          "12": 0.57
        }
      }
    }
  };

  function validateWeight(inputRow, errors) {
    var input = inputRow.querySelector("input");
    var inputValue = input.value;
    if (inputValue.length > 0 && inputValue <= 0) {
      errors.push([input.getAttribute("id"), "Weight must be above 0"]);
    }
  }

  function validateRPE(inputRow, errors) {
    var input = inputRow.querySelector("input");
    var inputValue = input.value;
    if (inputValue.length > 0 && inputValue < 6) {
      errors.push([input.getAttribute("id"), "RPE must be 6 or above"]);
    } else if (inputValue.length > 0 && inputValue > 10) {
      errors.push([input.getAttribute("id"), "RPE must be 10 or below"]);
    }
  }

  function validateReps(inputRow, errors) {
    var input = inputRow.querySelector("input");
    var inputValue = input.value;
    if (inputValue.length > 0 && inputValue <= 0) {
      errors.push([input.getAttribute("id"), "Reps must be above 0"]);
    } else if (inputValue.length > 0 && inputValue > 12) {
      errors.push([
        input.getAttribute("id"),
        "Sorry, this calculator only goes up to 12 reps"
      ]);
    }
  }

  function sanitizeAndGetInputErrors() {
    var errors = [];
    var inputRowsArr = [].slice.call(document.querySelectorAll(".input-row"));
    inputRowsArr.forEach(function(inputRow) {
      if (inputRow.className.indexOf("weight") > 0) {
        validateWeight(inputRow, errors);
      } else if (inputRow.className.indexOf("rpe") > 0) {
        validateRPE(inputRow, errors);
      } else if (inputRow.className.indexOf("reps") > 0) {
        validateReps(inputRow, errors);
      }
    });

    return errors;
  }

  function clearAllErrors() {
    var inputRowsArr = [].slice.call(document.querySelectorAll(".input-row"));
    inputRowsArr.forEach(function(inputRow) {
      inputRow.classList.remove("error");
      inputRow.querySelector(".error").innerHTML = "";
    });
  }

  function displayErrors(errors) {
    errors.forEach(function(arr) {
      var divName = arr[0];
      var errorText = arr[1];
      var inputRow = ".input-row." + divName;
      document.querySelector(inputRow).classList.add("error");
      document.querySelector(inputRow + " .error").innerHTML = errorText;
    });
  }

  function roundToFloat(value: number, round: number): string {
    var result = Math.round(value / round) * round;
    if (round % 1 === 0) {
      return result.toFixed(0);
    } else if (round % 0.5 === 0) {
      return result.toFixed(1);
    } else {
      return result.toFixed(2);
    }
  }

  function inputsEventHandler() {
    var desiredRPE = document.querySelector<HTMLInputElement>("input#desired-rpe").value;
    var desiredReps = document.querySelector<HTMLInputElement>("input#desired-reps").value;
    var givenRPE = document.querySelector<HTMLInputElement>("input#given-rpe").value;
    var givenReps = document.querySelector<HTMLInputElement>("input#given-reps").value;
    var givenWeight: number = parseFloat(document.querySelector<HTMLInputElement>("input#given-weight").value);

    clearAllErrors();
    var errors = sanitizeAndGetInputErrors();

    if (errors.length > 0) {
      displayErrors(errors);
      return false;
    }

    var haveAllGivens = givenWeight && givenRPE && givenReps;

    document.querySelector<HTMLInputElement>("input#desired-reps").disabled = !haveAllGivens;
    document.querySelector<HTMLInputElement>("input#desired-rpe").disabled = !haveAllGivens;
    var desiredWeightEl = document.querySelector("#solved-weight");
    var e1RMEl = document.querySelector("#e1RM");
    var ninetyFivePEl = document.querySelector("#ninetyFiveP");
    var eightyFivePEl = document.querySelector("#eightyFiveP");
    var eightyPEl = document.querySelector("#eightyP");
    var seventyFivePEl = document.querySelector("#seventyFiveP");
    var sixtyFivePEl = document.querySelector("#sixtyFiveP");

    if (haveAllGivens) {
      var givenRPEDecimal = RPEs["RPE"][givenRPE]["REPS"][givenReps];
      var estimated1RM = givenWeight / givenRPEDecimal;

      var roundingValue = Number.parseFloat(document.querySelector<HTMLInputElement>("select#rounding").value);

      e1RMEl.innerHTML = roundToFloat(estimated1RM, roundingValue);
      ninetyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.95, roundingValue);
      eightyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.85, roundingValue);
      eightyPEl.innerHTML = roundToFloat(estimated1RM * 0.8, roundingValue);
      seventyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.75, roundingValue);
      sixtyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.65, roundingValue);

      if (desiredRPE && desiredReps) {
        const desiredRPEDecimal: number = RPEs["RPE"][desiredRPE]["REPS"][desiredReps];
        desiredWeightEl.innerHTML = roundToFloat(
          Math.floor(estimated1RM * desiredRPEDecimal), roundingValue
        );
      } else {
        desiredWeightEl.innerHTML = "...";
      }
    } else {
      ninetyFivePEl.innerHTML = "...";
      eightyFivePEl.innerHTML = "...";
      eightyPEl.innerHTML = "...";
      seventyFivePEl.innerHTML = "...";
      sixtyFivePEl.innerHTML = "...";
    }
  }

  var inputsArr = [].slice.call(document.querySelectorAll("input"));
  inputsArr.forEach(function(input) {
    input.addEventListener("input", inputsEventHandler, false);
  });
  var roundingSelect = document.querySelector("select#rounding");
  roundingSelect.addEventListener("change", inputsEventHandler, false);
})();
