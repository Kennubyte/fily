import { Peer } from "peerjs";
let sendableFile

function createPeer(id: string){
    const peer = new Peer(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    peer.on('connection', function(conn) {
        conn.send(sendableFile().fileName);
        conn.on('data', function(data) {
            console.log(data);
        });
    });
}

function connectToPeer(id: string){
    const peer = new Peer(); // Create a new peer without an ID.
    
    // Ensure the peer is open before connecting.
    peer.on('open', () => {
        const conn = peer.connect(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
        conn.on('open', function() {
            conn.on('data', function(data) {
                console.log('Received', data);
            });
            conn.send('Hello testing!');
        });
    });    
}

function downloadableFileCallback(callback: Function){
    sendableFile = callback
}

export {
    createPeer,
    connectToPeer,
    downloadableFileCallback
}


function saveArrayBuffer(arrayBuffer: ArrayBuffer, filename: string) {
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }