/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./index.css"
import { Toaster } from "solid-toast";

render(() => 
<>
    <Toaster
    gutter={8}
    />
    <App />
</>
, document.getElementById("root")!);
