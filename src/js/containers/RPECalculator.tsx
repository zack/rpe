import * as React from "react";
import {EffortLevel, RepCount, RPE} from "../RPE";
import {RPEInput} from "./RPEInput";

export interface RPECalculatorState {

    givenWeight?: number;
    givenReps?: RepCount;
    givenRPE?: EffortLevel;
    desiredReps?: RepCount;
    desiredRPE?: EffortLevel;

    roundingValue: number;

    errors: { [id: string]: string }

}

export class RPECalculator extends React.Component<{}, RPECalculatorState> {

    constructor(props) {
        super(props);
        this.state = { errors: {}, roundingValue: 5.0 };
    }

    private roundToFloat = (value: number, round: number): string => {

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

    private handleInputChange = (id: string, value: any) => {

        const stateChanges = {
            [id]: value,
        } as RPECalculatorState;

        this.setState(stateChanges);
    };

    private handleRoundingChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            roundingValue: parseFloat(ev.target.value)
        });
    };

    private getEstimated1RM(allGiven: boolean = !!(this.state.givenRPE && this.state.givenReps && this.state.givenWeight)) {
        if(allGiven){
            try {
                return RPE.get1RM(this.state.givenWeight, this.state.givenRPE, this.state.givenReps);
            } catch (e) {
                console.warn("Unable to calculate RPE.", e);
                return Number.NaN;
            }
        }
        return Number.NaN;
    }

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

    private getDesiredRPE() {
        if(this.state.desiredRPE && this.state.desiredReps){
            try{
                return RPE.getFactor(this.state.desiredRPE, this.state.desiredReps);
            } catch (e) {
                console.warn("Unable to calculate desired RPE.", e);
                return Number.NaN;
            }
        }
        return Number.NaN;
    }

    render() {

        const allGiven: boolean = !!(this.state.givenRPE && this.state.givenReps && this.state.givenWeight);

        const estimated1RM = this.getEstimated1RM(allGiven);

        const desiredRPEDecimal: number = this.getDesiredRPE();

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

            <RPEInput id={"givenRPE"} label="RPE" value={this.state.givenRPE} onChange={this.handleInputChange} inputProps={{type: "number", className: "rpe"}} className={"bottom-border"}
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

            <RPEInput id={"desiredRPE"} label="RPE" value={this.state.desiredRPE} onChange={this.handleInputChange} className={"bottom-border"}
                      inputProps={{type: "number", className: "rpe", disabled: !allGiven}}
                      validator={this.repValidator}
            />

            <div className="results">
                <h3> Target weight: <span id="solved-weight"> {this.roundToFloat(estimated1RM * desiredRPEDecimal, this.state.roundingValue)} </span> </h3>
                <h3> 100% of e1RM: <span id="e1RM"> {this.roundToFloat(estimated1RM, this.state.roundingValue)} </span> </h3>
                <h3> 95% of e1RM: <span id="ninetyFiveP"> {this.roundToFloat(estimated1RM * 0.95, this.state.roundingValue)} </span> </h3>
                <h3> 85% of e1RM: <span id="eightyFiveP"> {this.roundToFloat(estimated1RM * 0.85, this.state.roundingValue)} </span> </h3>
                <h3> 80% of e1RM: <span id="eightyP"> {this.roundToFloat(estimated1RM * 0.80, this.state.roundingValue)} </span> </h3>
                <h3> 75% of e1RM: <span id="seventyFiveP"> {this.roundToFloat(estimated1RM * 0.75, this.state.roundingValue)} </span> </h3>
                <h3> 65% of e1RM: <span id="sixtyFiveP"> {this.roundToFloat(estimated1RM * 0.65, this.state.roundingValue)} </span> </h3>
            </div>

            <div className="options">
                <label htmlFor="rounding" className="rounding"> Rounding: </label>
                <select id="roundingValue" className="rounding" name="rounding" value={this.state.roundingValue}
                        onChange={this.handleRoundingChange}>
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