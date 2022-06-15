import axios from 'axios';


const sleep = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const tokenAuthorization = async (token, callback) => {
    axios({
            method: 'post',
            url: `https://api.digitalhumansdk.com/v1/token/validate`,
            timeout:10000,
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        }).then((res) => {
            if (res.status == 200)
            {
                callback({"roomData": res.data, "statusMsg": "Initializing Room"});
            }else{
                callback({"statusMsg": "Unable to Authenticate Room"});
            }
        }).catch((err) => {
                callback({"statusMsg": "Unable to Authenticate Room"});
        });
};

export const roomCreation = async(roomEndpoint, keycode, callback) => {
    axios({
            method: 'post',
            url: roomEndpoint,
            data: {
                keycode : keycode
            },
            timeout:10000,
            headers: {
                'Content-Type': 'application/json',
            }
            }).then((res) => {
                if (res.status == 200)
                {
                    callback({"status": true, "msg": "Ready to join room"});
                }
                else{
                    callback({"status": false, "msg": "Out of usable test rooms"})
                }
        }).catch((err) => {
                    callback({"status": false, "msg": "Error with request"});
                    return "";
                });
};

export const roomReadyParams = async (pixelStreamingWindow) => {
        await sleep(2300);
        pixelStreamingWindow.contentWindow.postMessage(JSON.stringify({"engineParams": 
                {
                    "ScreenWidth": 1980,
                    "ScreenHeight" : 1180
                }
            }), "*"); 
        
       pixelStreamingWindow.contentWindow.postMessage(JSON.stringify(
        {"engineParams": 
            {
            "IdleStyle": 2,
            "ChangeLighting": 0,
            "Emotion": "Neutral"
            }
        }), "*"); 
       return
};

export const transportSpeech = async (pixelStreamingWindow, msg) => {
    await sleep(500);
    if(msg == undefined || msg =="" || msg==null){
        console.log(`Requested message to send was null. Exiting speech tree`);
        return;
    }
    pixelStreamingWindow.contentWindow.postMessage(JSON.stringify({"textToSpeech": msg}), "*")
}

export const transportUnmuteState = async (pixelStreamingWindow) => {
    pixelStreamingWindow.contentWindow.postMessage(JSON.stringify({"unmute": true}), "*");
}

export const updateRoomArgs = async(pixelStreamingWindow, roomargs) => {

    let resolved_args = {"engineParams": {}}
    if (roomargs !== null){
        for (const [key, value] of Object.entries(roomargs)) {
            resolved_args['engineParams'][key] = value;
        }
        pixelStreamingWindow.contentWindow.postMessage(JSON.stringify(resolved_args), "*")
    }

    
}

export const broadcastCurrentClientAvatar = async (pixelStreamingWindow, avatar) => {
    //console.log("Broadcasting current avatar from state to server");
    await sleep(200);

    //Match the state of engine avatar names
    const mapping = {
        "female_01_m": "HumanEngineHead",
        "male_01_m" : "Male_01"
    }

    let value = mapping[avatar];

    if(value == null || value == undefined){
        //make avatar the resulting value if not in this mapping
        value = avatar;
    }
    pixelStreamingWindow.contentWindow.postMessage(JSON.stringify({"engineParams": {"ShowAvatar" : value}}), "*");  
    return
}