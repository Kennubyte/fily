import { Peer } from "peerjs";

function createPeer(id: string){
    const peer = new Peer(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    peer.on('connection', function(conn) {
        conn.on('data', function(data) {
            console.log(data);
        });
    });
}

function connectToPeer(id: string){
    const peer = new Peer();
    
    peer.on('open', () => {
        const conn = peer.connect(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
        conn.on('open', function() {

            conn.on('data', function(data) {
                console.log('Received', data);
            });

            conn.send({
                type: 'requestFileData',
            });

            conn.send({
                type: 'requestFile',
            });

        });
    });
}

export {
    createPeer,
    connectToPeer
}
