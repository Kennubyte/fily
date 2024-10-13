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
                    conn.send({ type: "responseFile", file: sendableFile().data });
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
            
            let fileData: Uint8Array | undefined; // Declare fileData with type

            conn.on('data', function(data: { 
                type: string; 
                fileName: string; 
                fileSize: number; 
                file: ArrayBuffer; 
                offset: number; 
            }) {
                switch (data.type) {
                    case "responseFileData":
                        console.log('File Data:', data.fileName, data.fileSize);
                        // Initialize fileData with the correct size
                        fileData = new Uint8Array(data.fileSize);
                        break;
            
                    case "responseFile":
                        if (!fileData) {
                            console.error('fileData is not initialized!');
                            return; // Exit if fileData isn't ready
                        }
                        
                        const percentage = (data.offset / data.fileSize) * 100;
                        console.log(`Progress: ${percentage.toFixed(2)}%`);
            
                        // Check bounds before setting
                        const incomingData = new Uint8Array(data.file);
                        if (data.offset + incomingData.length <= fileData.length) {
                            fileData.set(incomingData, data.offset);
                        } else {
                            console.error('Out of bounds error: Attempting to set beyond fileData size');
                        }
                        break;
            
                    case "responseFileEnd":
                        if (!fileData) {
                            console.error('fileData is not initialized!');
                            return; // Exit if fileData isn't ready
                        }
                        console.log('File Received:', data.fileName);
                        saveArrayBuffer(fileData.buffer, data.fileName);
                        break;
            
                    default:
                        console.warn('Unknown data type received:', data.type);
                        break;
                }
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