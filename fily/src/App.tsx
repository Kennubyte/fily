import Button from "@suid/material/Button";
import { TextField } from "@suid/material";
import { createSignal } from "solid-js";

import './peerManager'
import { connectToPeer, createPeer } from "./peerManager";

export default function App() {
  const [shareCode, setShareCode] = createSignal<string>("");
  const [sendableFile, setSendableFile] = createSignal<{ data: ArrayBuffer; fileName: string; fileSize: number }>();

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

  function handleFile() {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = (e) => {
      // getting a hold of the file reference
      const file = (e.target as HTMLInputElement).files[0];

      // setting up the reader
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        console.log(content);
        setSendableFile({
          data: content as ArrayBuffer,
          fileName: file.name,
          fileSize: file.size
        })
        setTimeout(() => {
          saveArrayBuffer(sendableFile().data, sendableFile().fileName);
        }, 5000);
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
    
    console.log("Connecting to", code);
    const response = await fetch(`http://localhost:8080/api/getResourceByCode/${code}`);
    if (!response.ok) {
      alert("Resource not found");
      return;
    }

    const responseInfo = await response.text();
    console.log(responseInfo)
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
        </form>
        <div>
          <Button variant="contained" on:click={handleFile}>
            Select File
          </Button>
        </div>
        <Button variant="contained" on:click={createPeer}>create peer</Button>
        <Button variant="contained" on:click={() => connectToPeer("123456")}>connect to peer</Button>
      </div>
    </>
  );
}
