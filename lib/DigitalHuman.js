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
            steps: props.steps || [],
            token: props.token || "",
            style: props.style || style,
            avatar: props.avatar || "female_01_m",
            onCurrStepTrigger: props.onCurrStepTrigger
        }

    }
    
    render(){
        return(
            <EdhElements token={this.state.token}>
                <FluidElement
                    human={this.state.avatar}
                    renderMode={this.state.render_mode}
                    inputMode={this.state.input_mode}
                    steps={this.state.steps}
                    style={this.state.style}
                    currStep={this.props.currStep}
                    onCurrStepTrigger={this.state.onCurrStepTrigger}
                 />
            </EdhElements>
        );
    };

}

export default DigitalHuman;