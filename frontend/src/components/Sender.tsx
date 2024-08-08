import {useEffect, useState} from 'react';

export function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc,setPc] = useState<RTCPeerConnection | null>(null);
    const [stream , setstream] = useState<MediaStream | null>(null);
    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080');
        //on socket connection.. send server a message saying hey I'm the sender
        socket.onopen =()=>{
            socket.send(JSON.stringify({type : "sender"}));
        }
        setSocket(socket);
    },[])
    async function streamVideo(){
        if (!socket) {
            console.log("socket not connected");
            return ;
        }
        const pc = new RTCPeerConnection();
        setPc(pc);
        pc.onnegotiationneeded = async() => {
            console.log("negotiation needed");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer); //sdp
            socket?.send(JSON.stringify({type : "createOffer" , sdp : pc.localDescription}));
        }

        pc.onicecandidate = (event) => {
            console.log(event);
            if(event.candidate){
                socket.send(JSON.stringify({type : "ICECandidate" , candidate : event.candidate}));
            }
        }
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if(msg.type === "createAnswer"){
                pc.setRemoteDescription(msg.sdp);
            }else if(msg.type === "ICECandidate"){
                pc.addIceCandidate(msg.candidate);
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({video : true , audio : true});
        setstream(stream);
        pc.addTrack(stream.getVideoTracks()[0]);

    }
    function stopStreaming(){
        console.log("stop streaming");
        
        if(stream){
            stream.getTracks().forEach(track => track.stop());
        }
        if(pc){
            pc.close();
        }
    }
    return <>
        <div>
            <button onClick={streamVideo}>Start streaming video</button>
            <button onClick={stopStreaming}>Stop streaming video</button>
            <div>
            { socket ? "Connected" : "Not connected" }
            </div>
        </div>
    </>
}