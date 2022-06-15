import React from "react";
import {roomReadyParams,
        transportSpeech,
        broadcastCurrentClientAvatar,
        transportUnmuteState,
        updateRoomArgs} from "./api-client";
import {Elements as Edh, ElementContext as EdhElements} from "./ElementContext";
import WrapperComponent from "./contextWrapperComponent";
import _ from "underscore";

class FluidElement extends React.Component {
         
    constructor(props){
        super(props);

        console.log("WARNING: RenderMode only runs in Simple Mode. ")
        console.log("WARNING: InputMode only runs Speech mode. ")
        this.state = {
            human: props.human,
            renderMode: 0,
            inputMode: 1,
            steps: props.steps,
            style: props.style,
            roomargs: props.roomargs,
            roomReady: false,
            chatActive: false,
            currStep: props.currStep,
            onCurrStepTrigger: props.onCurrStepTrigger,
            muted: true,
            initialized: false,
            sendSpeech: this.transportCurrentSpeech.bind(this)
        }

        this.pixelStreamingWindow = React.createRef();
    
    }

    componentDidMount(){
        window.addEventListener('message', this.messageTransport);
    }

    componentDidUpdate(prevState){
        if(this.state.currStep != prevState.currStep){
            this.transportCurrentSpeech();
        }
        if(this.state.human != prevState.human){
            let pixelStreamingWindow = this.pixelStreamingWindow.current;
            if(pixelStreamingWindow != undefined){
                broadcastCurrentClientAvatar(pixelStreamingWindow, this.state.human);
            }
        }

        if(this.state.roomargs != prevState.roomargs){
           let pixelStreamingWindow = this.pixelStreamingWindow.current;
            if(pixelStreamingWindow != undefined){
                updateRoomArgs(pixelStreamingWindow, this.state.roomargs);
            } 
        }
    }


    static getDerivedStateFromProps(props, state) {
        //console.log(`Current Props: ${props.currStep}, Current State: ${state.currStep}`);
        if (props.currStep !== state.currStep || 
            props.steps !== state.steps || 
            props.human !== state.human || 
            props.roomargs !== state.roomargs) {   
            return {
                currStep: props.currStep,
                steps: props.steps,
                human: props.human,
                roomargs: props.roomargs,
            };
        }
        return null;
    }


    initializeRoomReady = async () => {
        let pixelStreamingWindow = this.pixelStreamingWindow.current;
        if(pixelStreamingWindow != undefined){
            await roomReadyParams(pixelStreamingWindow);
            await broadcastCurrentClientAvatar(pixelStreamingWindow, this.state.human);
            if(this.state.roomargs !== undefined){
                await updateRoomArgs(pixelStreamingWindow, this.state.roomargs);
            }
            this.setState({initialized: true});
        }
    }

    beginSpeechCallback = async () => {
        let pixelStreamingWindow = this.pixelStreamingWindow.current;
        if(pixelStreamingWindow != undefined){
            await transportUnmuteState(pixelStreamingWindow);
        }    
        this.setState({muted: false});  

        let current = _.findWhere(this.state.steps, { id: this.state.currStep+"" });
        this.state.sendSpeech();
    }
    
    async transportCurrentSpeech()
    {
        let msg = _.findWhere(this.state.steps, { id: this.state.currStep +""});

        //console.log(msg);

        if(msg == undefined){
            //console.log("Unable to find message at specified ID. Cancelling speech request.");
            return;
        }

        let pixelStreamingWindow = this.pixelStreamingWindow.current;

        if(pixelStreamingWindow == undefined){
            //console.log("Something went wrong. pixelStreamingWindow is undefined");
            return;
        }

        transportSpeech(pixelStreamingWindow, msg['message']);
    }
    
    messageTransport = (event) => {

        let msg = undefined;
        try{msg = JSON.parse(event.data);} catch(e){ return; }

        if(msg == null || msg == undefined || typeof msg !== "object"){ return; }

        if ("SpeechEnded" in msg) {
            let current = _.findWhere(this.state.steps, { id: this.state.currStep +""});
            this.state.onCurrStepTrigger(this.state.currStep, current['trigger'], current['message']);
        }
    }

    render() {
        return(
            <Edh.Consumer>
                {(context) => {     
                    return !context.state.loading ? 
                    (
                        <div style={{display: "flex", flex:"1 1 auto", flexDirection: "column", position: "relative", maxWidth: "100%", maxHeight: "100%", overflowY: "hidden"}} className="FluidElementPlayer">
                            <iframe style={this.state.style} sandbox="allow-same-origin allow-forms allow-scripts" ref={this.pixelStreamingWindow} src={context.state.remoteRoom} scrolling="no" allow="autoplay" frameBorder="0"  />
                            <div style={{"position":"absolute","top": "5%","right": "5%", "height": "55px","width": "64px"}}>
                                <WrapperComponent
                                    active={!context.state.loading} 
                                    parentInitalized={this.state.initialized}
                                    initializedCallback={this.initializeRoomReady} 
                                    beginSpeechCallback={this.beginSpeechCallback}/>
                            </div>
                        </div>
                    )
                    : <div style={this.state.style}>
                        <div style={{width: "100%", height: "100%", background: "black", display: "flex", justifyContent: "center", alignItems: "center"}} className="loadingElement">
                        <p style={{color:"#5d198e", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "30px"}}>{context.state.statusMsg}</p>
                        </div>
                    </div>
                    
                }}
            </Edh.Consumer>
        )
    }
}


export default FluidElement;