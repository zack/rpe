import {RPE} from "./RPE";


function validateWeight(inputRow, errors) {
    const input = inputRow.querySelector("input");
    const inputValue = input.value;
    if (inputValue.length > 0 && inputValue <= 0) {
        errors.push([input.getAttribute("id"), "Weight must be above 0"]);
    }
}

function validateRPE(inputRow, errors) {
    const input = inputRow.querySelector("input");
    const inputValue = input.value;
    if (inputValue.length > 0 && inputValue < 6) {
        errors.push([input.getAttribute("id"), "RPE must be 6 or above"]);
    } else if (inputValue.length > 0 && inputValue > 10) {
        errors.push([input.getAttribute("id"), "RPE must be 10 or below"]);
    }
}

function validateReps(inputRow, errors) {
    const input = inputRow.querySelector("input");
    const inputValue = input.value;
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
    const errors = [];
    const inputRowsArr = [].slice.call(document.querySelectorAll(".input-row"));
    inputRowsArr.forEach(function (inputRow) {
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
    const inputRowsArr = [].slice.call(document.querySelectorAll(".input-row"));
    inputRowsArr.forEach(function (inputRow) {
        inputRow.classList.remove("error");
        inputRow.querySelector(".error").innerHTML = "";
    });
}

function displayErrors(errors) {
    errors.forEach(function (arr) {
        const divName = arr[0];
        const errorText = arr[1];
        const inputRow = ".input-row." + divName;
        document.querySelector(inputRow).classList.add("error");
        document.querySelector(inputRow + " .error").innerHTML = errorText;
    });
}

function roundToFloat(value: number, round: number): string {
    const result = Math.round(value / round) * round;
    if (round % 1 === 0) {
        return result.toFixed(0);
    } else if (round % 0.5 === 0) {
        return result.toFixed(1);
    } else {
        return result.toFixed(2);
    }
}

function inputsEventHandler() {
    const desiredRPE = document.querySelector<HTMLInputElement>("input#desired-rpe").value;
    const desiredReps = document.querySelector<HTMLInputElement>("input#desired-reps").value;
    const givenRPE = document.querySelector<HTMLInputElement>("input#given-rpe").value;
    const givenReps = document.querySelector<HTMLInputElement>("input#given-reps").value;
    const givenWeight: number = parseFloat(document.querySelector<HTMLInputElement>("input#given-weight").value);

    clearAllErrors();
    const errors = sanitizeAndGetInputErrors();

    if (errors.length > 0) {
        displayErrors(errors);
        return false;
    }

    const haveAllGivens = givenWeight && givenRPE && givenReps;

    document.querySelector<HTMLInputElement>("input#desired-reps").disabled = !haveAllGivens;
    document.querySelector<HTMLInputElement>("input#desired-rpe").disabled = !haveAllGivens;
    const desiredWeightEl = document.querySelector("#solved-weight");
    const e1RMEl = document.querySelector("#e1RM");
    const ninetyFivePEl = document.querySelector("#ninetyFiveP");
    const eightyFivePEl = document.querySelector("#eightyFiveP");
    const eightyPEl = document.querySelector("#eightyP");
    const seventyFivePEl = document.querySelector("#seventyFiveP");
    const sixtyFivePEl = document.querySelector("#sixtyFiveP");

    if (haveAllGivens) {
        const estimated1RM = RPE.get1RM(givenWeight, givenRPE, givenReps);

        const roundingValue = Number.parseFloat(document.querySelector<HTMLInputElement>("select#rounding").value);

        e1RMEl.innerHTML = roundToFloat(estimated1RM, roundingValue);
        ninetyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.95, roundingValue);
        eightyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.85, roundingValue);
        eightyPEl.innerHTML = roundToFloat(estimated1RM * 0.8, roundingValue);
        seventyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.75, roundingValue);
        sixtyFivePEl.innerHTML = roundToFloat(estimated1RM * 0.65, roundingValue);

        if (desiredRPE && desiredReps) {
            const desiredRPEDecimal: number = RPE.getFactor(desiredRPE, desiredReps);
            desiredWeightEl.innerHTML = roundToFloat(
                estimated1RM * desiredRPEDecimal, roundingValue
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

const inputsArr = [].slice.call(document.querySelectorAll("input"));
inputsArr.forEach(function (input) {
    input.addEventListener("input", inputsEventHandler, false);
});
const roundingSelect = document.querySelector("select#rounding");
roundingSelect.addEventListener("change", inputsEventHandler, false);
