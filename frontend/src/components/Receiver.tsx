import { useEffect , useRef } from "react";
export function Receiver(){
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(()=>{

        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen =()=>{
            socket.send(JSON.stringify({type : "receiver"}));
        }
        socket.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            let pc : RTCPeerConnection | null = null;
            if(msg.type === "createOffer"){
                const pc = new RTCPeerConnection();
                pc.setRemoteDescription(msg.sdp);
                pc.onicecandidate = (event) => {
                    console.log(event);
                    if(event.candidate){
                        socket.send(JSON.stringify({type : "ICECandidate" , candidate : event.candidate}));
                    }
                }
                pc.ontrack = (event) => {
                    // console.log(event);
                    // if(videoRef.current){
                    //     videoRef.current.srcObject = new MediaStream([event.track]);
                    // }
                    const video = document.createElement("video");
                    document.body.appendChild(video);
                    video.srcObject = new MediaStream([event.track]);
                    video.play();
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type : "createAnswer" , sdp : pc.localDescription}));
        }else if(msg.type === "ICECandidate"){
            if(pc!==null){
                //@ts-ignore
                pc.addIceCandidate(msg.candidate);
            }
        }
        
    }
    },[])

    return <>
        <div>
            <video ref={videoRef}></video>
        </div>
    </>
}