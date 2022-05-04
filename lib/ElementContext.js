import {tokenAuthorization, roomCreation} from "./api-client";
import React, {useContext, useEffect, useState} from "react";



export const RENDER_MODES = {
    LIVE: 0,
    SIMPLE: 1
}

export const INPUT_MODES = {
    TEXT: 0,
    SPEECH: 1
}


export const Elements = React.createContext();


export class ElementsContext extends React.Component {
    constructor(props)
    {
        super(props);

        this.state = {
            authenticated: false,
            loading: true,
            remoteRoom: "",
            token: props.token
        }
    }

    

    componentDidMount(){
        tokenAuthorization(this.state.token, this.validated);
    }

    roomReady = (response) => {
        this.setState({loading:false});
    }

    validated = (response) => {
        roomCreation(response.createRoom, response.keycode, this.roomReady)
        this.setState({remoteRoom:response.roomAddress, authenticated: true});
    }

    render(){
        return(
            <Elements.Provider value={{
                state: this.state
            }}>
                {this.props.children}
            </Elements.Provider>
        )
    }
}

export default ElementsContext;