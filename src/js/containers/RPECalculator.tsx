import * as React from "react";
import {EffortLevel, RepCount, RPE} from "../RPE";

export interface RPECalculatorState {

    givenWeight?: number;
    givenReps?: RepCount;
    givenRPE?: EffortLevel;
    desiredReps?: RepCount;
    desiredRPE?: EffortLevel;

    roundingValue: number;

    errors: { [id: string]: string }

}

export interface RPECalculatorProps {

}

type Validator<T> = (value: T) => string | null;

export class RPECalculator extends React.Component<RPECalculatorProps, RPECalculatorState> {

    static validators: {[id: string]: Validator<any> } = {
        "givenWeight": (value: number) => {
            if (value !== null && value !== undefined && value <= 0) {
                return "Weight must be above 0";
            }
            return null;
        }
    };

    validateWeight = (inputRow, errors: { [id: string]: string }) => {

        const input = inputRow.querySelector("input");
        const inputValue = input.value;

        if (inputValue.length > 0 && inputValue <= 0) {
            errors[input.getAttribute("id")] = "Weight must be above 0";
        }
    };

    validateRPE = (inputRow, errors: { [id: string]: string }) => {

        const input = inputRow.querySelector("input");
        const inputValue = input.value;

        const id = input.getAttribute("id");

        if (inputValue.length > 0 && inputValue < 6) {
            errors[id] = "RPE must be 6 or above";
        } else if (inputValue.length > 0 && inputValue > 10) {
            errors[id] = "RPE must be 10 or below";
        }

    };

    validateReps = (inputRow, errors: { [id: string]: string }) => {
        const input = inputRow.querySelector("input");
        const inputValue = input.value;

        const id = input.getAttribute("id");

        if (inputValue.length > 0 && inputValue <= 0) {
            errors[id] = "Reps must be above 0";
        } else if (inputValue.length > 0 && inputValue > 12) {
            errors[id] = "Sorry, this calculator only goes up to 12 reps";
        }
    };

/*    sanitizeAndGetInputErrors = () => {
        const errors: { [id: string]: string } = {};

        const inputRowsArr = [].slice.call(document.querySelectorAll(".input-row"));
        inputRowsArr.forEach(function (inputRow) {
            if (inputRow.className.indexOf("weight") > 0) {
                this.validateWeight(inputRow, errors);
            } else if (inputRow.className.indexOf("rpe") > 0) {
                this.validateRPE(inputRow, errors);
            } else if (inputRow.className.indexOf("reps") > 0) {
                this.validateReps(inputRow, errors);
            }
        });

        this.setState({errors});

        return errors;
    };*/

    roundToFloat = (value: number, round: number): string => {

        const result = Math.round(value / round) * round;

        if (Number.isNaN(result)) {
            return "";
        }
        if (round % 1 === 0) {
            return result.toFixed(0);
        } else if (round % 0.5 === 0) {
            return result.toFixed(1);
        } else {
            return result.toFixed(2);
        }
    };

    constructor(props) {
        super(props);
        this.state = { errors: {}, roundingValue: 5.0 };
    }

    hasError(id: string): boolean {
        return (id in this.state.errors) && !!this.state.errors[id];
    }

    handleInputChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        const input: HTMLInputElement | HTMLSelectElement = ev.target;

        let stateChanges = {
            [input.id]: input.value as any,
        } as RPECalculatorState;

        this.setState(stateChanges);
    };


    render() {

        //this.sanitizeAndGetInputErrors();

        const allGiven: boolean = !!(this.state.givenRPE && this.state.givenReps && this.state.givenWeight);

        const estimated1RM = allGiven ? RPE.get1RM(this.state.givenWeight, this.state.givenRPE, this.state.givenReps) : Number.NaN;
        console.log("1RM: ", estimated1RM);

        const desiredRPEDecimal: number = (this.state.desiredRPE && this.state.desiredReps) ?
            RPE.getFactor(this.state.desiredRPE, this.state.desiredReps) :
            Number.NaN;

        const givenWeightError = RPECalculator.validators.givenWeight(this.state.givenWeight);

        return <div id="content">
            <div className="header">
                <h1> RPE Calculator </h1>
            </div>

            <div className="subheader">
                <h3> Basis Numbers </h3>
            </div>

            <div className={`input-row given-weight ${givenWeightError ? "error" : ""}`}>
                <div className="error">{givenWeightError}</div>
                <div className="input-container">
                    <label htmlFor="given-weight"> Weight </label>
                    <input id="givenWeight" type="number" step="0.01" className="weight" value={this.state.givenWeight} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className={`input-row given-reps ${this.hasError("givenReps")}`}>
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="given-reps"> Reps </label>
                    <input id="givenReps" type="number" className="reps" value={this.state.givenReps} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="input-row given-rpe bottom-border">
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="given-rpe"> RPE </label>
                    <input id="givenRPE" type="number" className="rpe" value={this.state.givenRPE} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="subheader">
                <h3> Target Numbers </h3>
            </div>

            <div className="input-row desired-reps">
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="desired-reps"> Reps </label>
                    <input id="desiredReps" type="number" className="reps" disabled={!allGiven} value={this.state.desiredReps} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="input-row desired-rpe bottom-border">
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="desired-rpe"> RPE </label>
                    <input id="desiredRPE" type="number" className="rpe" disabled={!allGiven} value={this.state.desiredRPE} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="results">
                <h3> Target weight: <span id="solved-weight"> {this.roundToFloat(estimated1RM * desiredRPEDecimal, this.state.roundingValue)} </span> </h3>
                <h3> 100% of e1RM: <span id="e1RM"> {this.roundToFloat(estimated1RM, this.state.roundingValue)} </span> </h3>
                <h3> 95% of e1RM: <span id="ninetyFiveP"> {this.roundToFloat(estimated1RM * 0.95, this.state.roundingValue)} </span></h3>
                <h3> 85% of e1RM: <span id="eightyFiveP"> {this.roundToFloat(estimated1RM * 0.85, this.state.roundingValue)} </span></h3>
                <h3> 80% of e1RM: <span id="eightyP"> {this.roundToFloat(estimated1RM * 0.80, this.state.roundingValue)} </span></h3>
                <h3> 75% of e1RM: <span id="seventyFiveP"> {this.roundToFloat(estimated1RM * 0.75, this.state.roundingValue)} </span></h3>
                <h3> 65% of e1RM: <span id="sixtyFiveP"> {this.roundToFloat(estimated1RM * 0.65, this.state.roundingValue)} </span></h3>
            </div>

            <div className="options">
                <label htmlFor="rounding" className="rounding"> Rounding: </label>
                <select id="roundingValue" className="rounding" name="rounding" value={this.state.roundingValue} onChange={this.handleInputChange}>
                    <option value="5">5.0</option>
                    <option value="2.5">2.5</option>
                    <option value="1">1.0</option>
                    <option value="0.01">0.01</option>
                </select>
            </div>

            <div className="footer">
                <span>© 2018 Zack Youngren</span>
                <br/>
                <span>
                    <em> Code on <a href="https://www.github.com/zack/rpe">GitHub</a> </em>
                </span>
            </div>
        </div>
    }
}