import React, {useContext, useEffect, useState} from "react";

const WrapperComponent = (props) => {
    const [active, setActive] = React.useState(false);
    const [parentInitalized, setParentInitialized] = React.useState(false);
    const [muted, setMuteState] = React.useState(true);

    const theme = {
        "width": "100%",
        "height": "100%",
        "background": "url('https://stage-demo.digitalhumansdk.com/unmute-64x55.png')",
        "backgroundColor": "transparent",
        "backgroundPosition":"center",
        "backgroundRepeat":"no-repeat",
        "backgroundPosition": "0px 0px",  /* equivalent to 'top left' */
        "WebkitBoxShadow": "none",
        "MozBoxShadow": "none",
        "boxShadow": "none",
        "border": "none"
    }

    useEffect(() =>{
        if(active == false && props.active == true)
        {
            props.initializedCallback();
            setActive(true);
        }

        if(!parentInitalized && props.parentInitalized){
            setParentInitialized(true);
        }
    });

    return( <React.Fragment>
                {(active && muted && parentInitalized) ? <button style={theme} 
                                                onMouseEnter={(e) => {e.target.style.cursor="pointer"}}
                                                onMouseLeave={(e) => {e.target.style.cursor="default"}} 
                                                onClick={event=> { 
                                                                setMuteState(false); 
                                                                props.beginSpeechCallback();  
                                                            }
                                                        }></button> : <div></div>}
            </React.Fragment>)
}

export default WrapperComponent;