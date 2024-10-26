import Button from "@suid/material/Button";
import { TextField } from "@suid/material";
import { createEffect, createSignal } from "solid-js";

import { 
  LinearProgress,
} from "@suid/material"


import './peerManager'
import { connectToPeer, createPeer, downloadableFileCallback, stopSharing } from "./peerManager";
import toast from "solid-toast";

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
    setShareCode("XXXXXX");
  
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files[0];
  
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFileLocalProgress(percentComplete.toFixed(2))
        }
      };


      toast.custom((t) => {
        const progress = Number(fileLocalProgress());
      
        // Check if progress is 100 and dismiss the toast
        if (progress === 100) {
          toast.dismiss(t.id); // Dismiss the toast
        }
      
        return (
          <div class="px-6 py-3 pr-12 bg-white shadow-md font-medium relative">
            Reading file to memory...
            <LinearProgress variant="determinate" value={progress} />
            <button
              class="bg-gray-200/80 hover:bg-gray-300 flex justify-center top-1/2 -translate-y-1/2 items-center w-6 h-6 right-2.5 absolute"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              &times;
            </button>
          </div>
        );
      }, {
        duration: 99999999999999, 
        unmountDelay: 0
      });
      
      
      reader.readAsArrayBuffer(file);
  
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        console.log("File read complete");
        toast.success("File read complete");
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
      toast('The code must be a number')
      setReceivingFile(false);
      return;
    }

    if (code.length !== 6) {
      toast('The code must be 6 digits')
      setReceivingFile(false);
      return;
    }

    connectToPeer(code);
    setReceivingFile(true);

  }

  const [isModalOpen, setIsModalOpen] = createSignal(false);

  return (
    <div class="flex h-screen items-center justify-center p-4">
      <div class="card p-6 bg-stone-200 shadow-2xl rounded-lg w-full max-w-2xl">
        <div class="card-body">
          <h2 class="card-title text-3xl mb-10 justify-center flex">Fily</h2>
  
          <div class="flex flex-col md:flex-row gap-10 mb-5">
            <form onSubmit={handleConnect} class="grid gap-5 flex-1">
              <TextField
                label="Enter Code"
                disabled={!!shareCode() || receivingFile()}
                type="number"
                name="connectionCode"
                class="flex-1 h-12"
              />
              <Button
                variant="contained"
                disabled={!!shareCode() || receivingFile()}
                type="submit"
                class="h-12 w-full"
                >
                Download {receivingFile() ? fileDownloadProgress() + "%" : ""}
              </Button>
            </form>
  
            <div class="hidden md:block h-[250px] min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400" />

            <div class="grid flex-1 gap-5">
              <TextField
                  label="Your Code"
                  type="number"
                  value={shareCode()}
                  disabled={receivingFile()}
                  InputProps={{
                    readOnly: true,
                    
                  }}
                  class="flex-1 h-12"
                />
              <Button 
                variant="contained" 
                onClick={handleFile}
                disabled={!!shareCode() || receivingFile()}
                class="h-12 w-full"
              >
                Select File {!!shareCode() || receivingFile() ? fileLocalProgress() + "%" : ""}
              </Button>
            </div>
          </div>
  
          <Button 
            variant="contained" 
            class="h-12 w-full"
            color="error"
            disabled={!!!shareCode() != receivingFile()}
            on:click={() => {
              stopSharing();
              setShareCode("");
              setSendableFile(undefined);
              setReceivingFile(false);
            }}
          >
            Stop
          </Button>

        </div>
          <Button 
              variant="text" 
              class="mt-4 w-full h-12"
              onClick={() => setIsModalOpen(true)}
            >
            How to Use?
          </Button>
      </div>

      {isModalOpen() && (
        <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <h2 class="text-2xl mb-4">How to Use Fily</h2>
            <p class="mb-4">
              To share a file, click on "Select File" and choose the file you want to share. A code will be generated which you can share with others.
            </p>
            <p class="mb-4">
              To download a file, enter the code provided by the sender and click "Download".
            </p>
            <Button 
              variant="contained" 
              class="h-12 w-full"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
