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

interface RPEInputProps<T> {
    id: string;
    label: string;
    value: T;
    validator: Validator<T>;
    onChange: (id: string, value: T) => void;

    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

function RPEInput<T extends string | number | string[]>(props: RPEInputProps<T>) {

    const validationError = props.validator(props.value);

    const handleChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        const input: HTMLInputElement | HTMLSelectElement = ev.target;

        props.onChange(props.id, input.value as T);
    };

    return <div className={`input-row given-weight ${validationError ? "error" : ""}`}>
        <div className="error">{validationError}</div>
        <div className="input-container">
            <label htmlFor={props.id}> {props.label} </label>
            <input id={props.id}{...props.inputProps} value={props.value} onChange={handleChange}/>
        </div>
    </div>
}

export class RPECalculator extends React.Component<RPECalculatorProps, RPECalculatorState> {

    constructor(props) {
        super(props);
        this.state = {errors: {}, roundingValue: 5.0};
    }

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

    handleInputChange = (id: string, value: any) => {

        let stateChanges = {
            [id]: value,
        } as RPECalculatorState;

        this.setState(stateChanges);
    };

    repValidator = (value: string) => {
        if (value !== null && value !== undefined) {
            const reps = parseInt(value);
            if(reps <= 0){
                return "Reps must be greater than 0";
            }
            if(reps > 12){
                return "Sorry, this calculator only goes up to 12 reps";
            }
        }
        return null;
    };

    render() {

        //this.sanitizeAndGetInputErrors();

        const allGiven: boolean = !!(this.state.givenRPE && this.state.givenReps && this.state.givenWeight);

        const estimated1RM = allGiven ? RPE.get1RM(this.state.givenWeight, this.state.givenRPE, this.state.givenReps) : Number.NaN;
        console.log("1RM: ", estimated1RM);

        const desiredRPEDecimal: number = (this.state.desiredRPE && this.state.desiredReps) ?
            RPE.getFactor(this.state.desiredRPE, this.state.desiredReps) :
            Number.NaN;
        return <div id="content">
            <div className="header">
                <h1> RPE Calculator </h1>
            </div>

            <div className="subheader">
                <h3> Basis Numbers </h3>
            </div>

            <RPEInput id={"givenWeight"} label={"Weight"} value={this.state.givenWeight} onChange={this.handleInputChange} inputProps={{type: "number", step: "0.01", className: "weight"}}
                      validator={(value: number) => {
                          if (value !== null && value !== undefined && value <= 0) {
                              return "Weight must be above 0";
                          }
                          return null;
                      }}
            />

            <RPEInput id={"givenReps"} label="Reps" value={this.state.givenReps} onChange={this.handleInputChange} inputProps={{type: "number", className: "reps"}}
                      validator={this.repValidator}
            />

            <RPEInput id={"givenRPE"} label="RPE" value={this.state.givenRPE} onChange={this.handleInputChange} inputProps={{type: "number", className: "rpe"}}
                      validator={(value: string) => {
                          if (value !== null && value !== undefined) {
                              const rpe = parseInt(value);
                              if(rpe < 6 || rpe > 10){
                                  return "RPE must be at least 6 and no more than 10";
                              }
                          }
                          return null;
                      }}
            />

            <div className="subheader">
                <h3> Target Numbers </h3>
            </div>

            <RPEInput id={"desiredReps"} label="Reps" value={this.state.desiredReps} onChange={this.handleInputChange}
                      inputProps={{type: "number", className: "reps", disabled: !allGiven}}
                      validator={this.repValidator}
            />

            <div className="input-row desired-reps">
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="desired-reps"> Reps </label>
                    <input id="desiredReps" type="number" className="reps" disabled={!allGiven}
                           value={this.state.desiredReps} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="input-row desired-rpe bottom-border">
                <div className="error"></div>
                <div className="input-container">
                    <label htmlFor="desired-rpe"> RPE </label>
                    <input id="desiredRPE" type="number" className="rpe" disabled={!allGiven}
                           value={this.state.desiredRPE} onChange={this.handleInputChange}/>
                </div>
            </div>

            <div className="results">
                <h3> Target weight: <span
                    id="solved-weight"> {this.roundToFloat(estimated1RM * desiredRPEDecimal, this.state.roundingValue)} </span>
                </h3>
                <h3> 100% of e1RM: <span id="e1RM"> {this.roundToFloat(estimated1RM, this.state.roundingValue)} </span>
                </h3>
                <h3> 95% of e1RM: <span
                    id="ninetyFiveP"> {this.roundToFloat(estimated1RM * 0.95, this.state.roundingValue)} </span></h3>
                <h3> 85% of e1RM: <span
                    id="eightyFiveP"> {this.roundToFloat(estimated1RM * 0.85, this.state.roundingValue)} </span></h3>
                <h3> 80% of e1RM: <span
                    id="eightyP"> {this.roundToFloat(estimated1RM * 0.80, this.state.roundingValue)} </span></h3>
                <h3> 75% of e1RM: <span
                    id="seventyFiveP"> {this.roundToFloat(estimated1RM * 0.75, this.state.roundingValue)} </span></h3>
                <h3> 65% of e1RM: <span
                    id="sixtyFiveP"> {this.roundToFloat(estimated1RM * 0.65, this.state.roundingValue)} </span></h3>
            </div>

            <div className="options">
                <label htmlFor="rounding" className="rounding"> Rounding: </label>
                <select id="roundingValue" className="rounding" name="rounding" value={this.state.roundingValue}
                        onChange={this.handleInputChange}>
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