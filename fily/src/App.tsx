import Button from "@suid/material/Button";
import { TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { Box, LinearProgress } from "@suid/material";


import './peerManager'
import { connectToPeer, createPeer, downloadableFileCallback } from "./peerManager";

export default function App() {
  const [shareCode, setShareCode] = createSignal<string>("");
  const [sendableFile, setSendableFile] = createSignal<{ data: ArrayBuffer; fileName: string; fileSize: number }>();
  const [fileLocalProgress, setFileLocalProgress] = createSignal<string>("0");
  const [fileDownloadProgress, setFileDownloadProgress] = createSignal<string>("0");
  downloadableFileCallback(sendableFile, setFileDownloadProgress)

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
      return;
    }

    if (code.length !== 6) {
      alert("Code must be 6 digits");
      return;
    }

    connectToPeer(code);

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
    <>
      <h1 class="text-3xl">Your Code is: {shareCode()}</h1>
      <div class="flex gap-5">
        <form onSubmit={handleConnect}>
          <TextField label="Enter Code" disabled={!!shareCode()} type="number" name="connectionCode" />
          <Button variant="contained" disabled={!!shareCode()} type="submit">
            Connect
          </Button>
          <Box sx={{ width: "100%" }}>
            <LinearProgress variant="determinate" value={Number(fileDownloadProgress())} />
          </Box>
        </form>
        <div>
          <Button variant="contained" on:click={handleFile}>
            Select File
          </Button>
          <Box sx={{ width: "100%" }}>
            <LinearProgress variant="determinate" value={Number(fileLocalProgress())} />
          </Box>
        </div>
      </div>
    </>
  );
}
