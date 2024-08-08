import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket : null | WebSocket = null;
let receiverSocket : null | WebSocket = null;

wss.on("connection", function connection(ws){
    ws.on("error", console.error);

    ws.on("message", function message (data : any){
        const message = JSON.parse(data);

        if(message.type === "sender"){
            console.log("sender connected");
            senderSocket = ws;
        }else if(message.type === "receiver"){
            console.log("receiver connected");
            receiverSocket = ws;
        }else if(message.type==="createOffer"){ // sender creates anf offer, which needs to be sent to receiver
                console.log("Offer created by sender");
                receiverSocket?.send(JSON.stringify({type : "createOffer" , sdp : message.sdp}));
        }else if(message.type==="createAnswer"){ 
                console.log("Answer created by receiver");
                senderSocket?.send(JSON.stringify({type : "createAnswer" , sdp : message.sdp}));
        }else if(message.type==="ICECandidate"){
            if(ws===senderSocket){
                receiverSocket?.send(JSON.stringify({type : "ICECandidate" , candidate : message.candidate}));
            }else if(ws===receiverSocket){
                senderSocket?.send(JSON.stringify({type : "ICECandidate" , candidate : message.candidate}));
            }
        }
    })
})