import { Peer } from "peerjs";
import toast from "solid-toast";
let sendableFile
let setFileDownloadProgress
let setReceivingFile
let peer: Peer;
function createPeer(id: string){
    peer = new Peer(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    peer.on('connection', function(conn) {  
        
        conn.on('data', function(data: { type: string; message: any }) {

            switch (data.type) {
                case "requestFileData":
                    conn.send({ type: "responseFileData", fileName: sendableFile().fileName, fileSize: sendableFile().fileSize });
                    break;

                case "requestFile":
                    const fileData = sendableFile().data;
                    const fileName = sendableFile().fileName;
                
                    const chunkSize = 128 * 1024;
                    let offset = 0;
                
                    function sendNextChunk() {
                        const chunk = fileData.slice(offset, offset + chunkSize);
                        
                        conn.send({
                            type: "responseFile",
                            file: chunk,
                            fileSize: fileData.byteLength,
                            fileName: fileName,
                            offset: offset
                        });
                
                        offset += chunkSize;
                
                        if (offset < fileData.byteLength) {
                            setTimeout(sendNextChunk, 0);
                        } else {
                            conn.send({ type: "responseFileEnd", fileName: fileName });
                        }
                    }
                
                    sendNextChunk();
                    break;
                    
    
                default:
                    console.log('Unknown type:', data.type);
                    break;
            }
        });
    });
    
}

function connectToPeer(id: string){
    peer = new Peer();
    
    peer.on('open', () => {
        const conn = peer.connect(id + "-filyPeer-VWdOKQrqGPEtCm7sdiWmZAbtK");
        
        conn.once('open', function() {
            toast.success("Connection to host successful");

            conn.once('close', function() {
                stopSharing()
                toast.error("Connection to host closed");
            });
            
            let fileData: Uint8Array | undefined;
            
            conn.on('data', function(data: { 
                type: string; 
                fileName: string; 
                fileSize: number; 
                file: ArrayBuffer; 
                offset: number; 
            }) {
                console.log(data.type)
                switch (data.type) {

                    case "responseFileData":
                        console.log('File Data:', data.fileName, data.fileSize);
                        fileData = new Uint8Array(data.fileSize);
                        break;
            
                    case "responseFile":
                        if (!fileData) {
                            console.error('fileData is not initialized!');
                            return;
                        }
                        
                        const percentage = (data.offset / data.fileSize) * 100;
                        console.log(`Progress: ${percentage.toFixed(2)}%`);
                        setFileDownloadProgress(percentage.toFixed(2))
            
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
                            return;
                        }
                        console.log('File Received:', data.fileName);
                        saveArrayBuffer(fileData.buffer, data.fileName);
                        toast.success("File downloaded successfully");
                        stopSharing()
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

        peer.on('error', function(err) {
            stopSharing()
            toast.error("" + err);
        });
    });    
}


function stopSharing(){

    peer.destroy();
    setReceivingFile(false);
}


function downloadableFileCallback(callback: Function, callback2: Function, callback3: Function){
    sendableFile = callback
    setFileDownloadProgress = callback2
    setReceivingFile = callback3
}

export {
    createPeer,
    connectToPeer,
    downloadableFileCallback,
    stopSharing
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