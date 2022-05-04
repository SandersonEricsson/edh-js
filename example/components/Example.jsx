import React, {useCallback} from 'react';
import DigitalHuman from '../../lib/index';
import "./app.css";

class Example extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            example: false,
            currStep: "1"
        }
    }

    sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /*
    * Example Callback function that asyncronously waits for 3 seconds between message completes to send a new message
    */
    myTalkingFinishedAsyncCallback = async (currStep, triggerStep, msg) => {

        //My outside callback to trigger whenever I want
        console.log(currStep);
        console.log(triggerStep);
        console.log(msg);

        // Example trigger condition. Wait 3 seconds between calls
        await this.sleep(3000);

        this.setState({currStep: triggerStep});
        
    };
    
    /**
     * Example Callback function that waits for example to be true to trigger next speech dialogue
     */
    myTalkingFinishedCallback = (currStep, trigger, msg) => {

        console.log(currStep);
        console.log(trigger);
        console.log(msg);

        //Do something to make this state update in your app to trigger next call
        if(this.state.example){
            this.setState({currStep: trigger});
        }
    };

    render() {

        return(
            <DigitalHuman
                token={""}
                steps={[
                        {
                        id: '1',
                        message: 'Hello I am Jesse.',
                        trigger: "2"
                        },
                        {
                        id: '2',
                        message: 'I am a Digital Assistant who work with your business.',
                        trigger: "3"
                        },
                        {
                        id: '3',
                        message: 'Let me know if there is anything else I can help you with.',
                        trigger: "4"
                        },
                        {
                        id: '4',
                        trigger: null
                        },
                    ]}
                style={{
                        top: 0,
                        left: 0,
                        objectFit: "fill",
                        width: "100vw",
                        maxWidth: "100%",
                        height: "100vh",
                        maxHeight: "100%",
                        zIndex: 1,
                    }}
                avatar={"male_01_m"}
                currStep={this.state.currStep}
                onCurrStepTrigger={this.myTalkingFinishedAsyncCallback} />
        )
    }
}
export default Example