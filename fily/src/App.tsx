import Button from "@suid/material/Button";
import { TextField } from "@suid/material";
import { createSignal } from "solid-js";

export default function App() {
  const [shareCode, setShareCode] = createSignal<string>("");
  const [sendableFile, setSendableFile] = createSignal<{ data: ArrayBuffer; fileName: string; fileSize: number }>();

  function saveArrayBuffer(arrayBuffer: ArrayBuffer, filename: string) {
    // Step 1: Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

    // Step 2: Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Step 3: Create an anchor element and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append to body
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Free up memory
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

  function handleConnect(e: Event) {
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
      </div>
    </>
  );
}
