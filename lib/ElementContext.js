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
            statusMsg: "",
            remoteRoom: "",
            token: props.token
        }
    }

    

    componentDidMount(){
        tokenAuthorization(this.state.token, this.validated);
    }

    roomReady = (response) => {
        if(!response['status']){
            this.setState({loading: true, statusMsg: response['msg']})
        }else{
            this.setState({loading:false, statusMsg: response['msg']});
        } 
    }

    validated = (response) => {
        if("roomData" in response){
            console.log(response['roomData'])
            let res = response['roomData'];
            roomCreation(res.createRoom, res.keycode, this.roomReady)
            this.setState({remoteRoom:res.roomAddress, authenticated: true})
        }
        this.setState({statusMsg: response.statusMsg});
        
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