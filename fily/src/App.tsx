import Button from "@suid/material/Button";
import { TextField } from "@suid/material";
import { createSignal } from "solid-js";

import { 
  LinearProgress,
} from "@suid/material"


import './peerManager'
import { connectToPeer, createPeer, downloadableFileCallback, stopSharing } from "./peerManager";

export default function App() {
  const [shareCode, setShareCode] = createSignal<string>("");
  const [sendableFile, setSendableFile] = createSignal<{ data: ArrayBuffer; fileName: string; fileSize: number }>();
  const [receivingFile, setReceivingFile] = createSignal<boolean>(false);
  const [fileLocalProgress, setFileLocalProgress] = createSignal<string>("0");
  const [fileDownloadProgress, setFileDownloadProgress] = createSignal<string>("0");
  downloadableFileCallback(sendableFile, setFileDownloadProgress, setReceivingFile)

  function handleFile() {
    const input = document.createElement("input");
    input.type = "file";
  
    input.onchange = (e) => {
      // getting a hold of the file reference
      const file = (e.target as HTMLInputElement).files[0];
  
      // setting up the reader
      const reader = new FileReader();
      
      // Log progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFileLocalProgress(percentComplete.toFixed(2))
        }
      };
  
      reader.readAsArrayBuffer(file);
  
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        console.log("File read complete");
        console.log(content);
        
        setSendableFile({
          data: content as ArrayBuffer,
          fileName: file.name,
          fileSize: file.size
        });
  
        const code = Math.random().toString().slice(2, 8);
        setShareCode(code);
        createPeer(code);
      };
    };
  
    input.click();
  }
  

  async function handleConnect(e: Event) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const code = [...data.entries()][0][1] as unknown as string;

    if (!code.match(/^\d+$/)) {
      alert("Code must be a number");
      setReceivingFile(false);
      return;
    }

    if (code.length !== 6) {
      alert("Code must be 6 digits");
      setReceivingFile(false);
      return;
    }

    connectToPeer(code);
    setReceivingFile(true);

    /*     
    console.log("Connecting to", code);
    const response = await fetch(`http://localhost:8080/api/getResourceByCode/${code}`);
    if (!response.ok) {
      alert("Resource not found");
      return;
    }

    const responseInfo = await response.text();
    console.log(responseInfo)
    */


  }

  return (
    <div class="flex h-screen items-center justify-center">
      <div class="card bg-gray-200 p-10 shadow-2xl rounded-lg max-w-2xl">
        <div class="card-body">
          <h2 class="card-title text-3xl mb-10 justify-center flex">Fily</h2>
  
          <div class="flex gap-x-10 mb-5">
            <form onSubmit={handleConnect} class="grid gap-5 flex-1">
              <TextField
                label="Enter Code"
                disabled={!!shareCode() || receivingFile()}
                type="number"
                name="connectionCode"
                class="flex-1 h-12" // This sets the height and makes it grow
              />
              <Button
                variant="contained"
                disabled={!!shareCode() || receivingFile()}
                type="submit"
                class="h-12 w-full" // Ensure same height
              >
                Connect
              </Button>
            </form>
  
            <div class="grid flex-1 gap-5">
              <TextField
                  label="Sharing Code"
                  type="number"
                  value={shareCode()}
                  disabled={receivingFile()}
                  InputProps={{
                    readOnly: true,
                  }}
                  class="flex-1 h-12" // This sets the height and makes it grow
                />
              <Button 
                variant="contained" 
                onClick={handleFile}
                disabled={!!shareCode() || receivingFile()}
                class="h-12 w-full" // Ensuring the height matches
              >
                Select File
              </Button>
            </div>
          </div>
  
          <Button 
            variant="contained" 
            class="h-12 w-full" // Ensuring the height matches
            color="error"
            disabled={!!!shareCode() != receivingFile()}
            on:click={() => {
              stopSharing();
              setShareCode("");
              setSendableFile(undefined);
              setReceivingFile(false);
            }}
          >
            Stop Sharing
          </Button>
        </div>
      </div>
    </div>
  );
  
  
  
}

{/* <form onSubmit={handleConnect} class="gap-3 gap">
<TextField label="Enter Code" disabled={!!shareCode()} type="number" name="connectionCode" />
<Button variant="contained" disabled={!!shareCode()} type="submit">
  Connect
</Button>
</form>
<div>
<span>Your Code is: {shareCode()}</span>
<Button variant="contained" on:click={handleFile}>
  Select File
</Button>
</div> */}