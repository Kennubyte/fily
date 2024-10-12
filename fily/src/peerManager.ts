import { Peer } from "peerjs";

function createPeer(){
    const peer = new Peer();
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
    const peer = new Peer(); // Create a new peer without an ID.
    
    // Ensure the peer is open before connecting.
    peer.on('open', () => {
        const conn = peer.connect(id);
        conn.on('open', function() {
            conn.on('data', function(data) {
                console.log('Received', data);
            });
            conn.send('Hello testing!');
        });
    });
}

export {
    createPeer,
    connectToPeer
}
