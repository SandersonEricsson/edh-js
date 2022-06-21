import {roomReadyParams} from "./api-client";
import { ElementsContext as EdhElements} from './ElementContext';
import FluidElement from "./FluidElement"
import axios from 'axios';

import React from "react";



class DigitalHuman extends React.Component {


    constructor(props) {
        super(props);

        const style = {
                top: 0,
                left: 0,
                objectFit: "fill",
                width: "50vw",
                height: "50vh",
                zIndex: 1,
            }

        this.state = {
            render_mode: props.render_mode || 1,
            input_mode: props.input_mode || 1,
            token: props.token || "",
            style: props.style || style,
            onCurrStepTrigger: props.onCurrStepTrigger
        }

    }
    
    render(){

        let avatarProp = (this.props.avatar === undefined) ? "female_01_m" : this.props.avatar;
        let avatar = (this.props.human == undefined) ? avatarProp : this.props.human;
        return(
            <EdhElements token={this.state.token}>
                <FluidElement
                    human={avatar}
                    roomargs = {this.props.roomargs}
                    renderMode={this.state.render_mode}
                    inputMode={this.state.input_mode}
                    steps={this.props.steps}
                    style={this.state.style}
                    currStep={this.props.currStep}
                    onCurrStepTrigger={this.state.onCurrStepTrigger}
                 />
            </EdhElements>
        );
    };

}

export default DigitalHuman;
