import { Peer } from "peerjs";
let sendableFile

function createPeer(id: string){
    const peer = new Peer(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    peer.on('connection', function(conn) {
        conn.on('data', function(data: { type: string; message: any }) {
            console.log(data); // Log the incoming data
    
            switch (data.type) {
                case "requestFileData":
                    conn.send({ type: "responseFileData", fileName: sendableFile().fileName, fileSize: sendableFile().fileSize });
                    break;

                case "requestFile":
                    const fileData = sendableFile().data; // Assuming this is an ArrayBuffer or similar
                    const fileName = sendableFile().fileName;
                
                    const chunkSize = 64 * 1024; // chunk size in bytes
                    let offset = 0;
                
                    function sendNextChunk() {
                        const chunk = fileData.slice(offset, offset + chunkSize);
                        
                        conn.send({
                            type: "responseFile",
                            file: chunk,
                            fileSize: fileData.byteLength,
                            fileName: fileName,
                            offset: offset // Send the offset to track which chunk is being sent
                        });
                
                        offset += chunkSize;
                
                        // Check if there's more data to send
                        if (offset < fileData.byteLength) {
                            setTimeout(sendNextChunk, 0);
                        } else {
                            conn.send({ type: "responseFileEnd", fileName: fileName });
                        }
                    }
                
                    sendNextChunk(); // Start sending chunks
                    break;
                    
    
                // Add more cases if needed
                default:
                    console.log('Unknown type:', data.type);
                    break;
            }
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