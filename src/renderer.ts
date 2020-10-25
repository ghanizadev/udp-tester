import "./index.css";
import { ipcRenderer } from "electron";

document.querySelector("button#send").addEventListener("click", () => {
  const address = (document.querySelector("input#address") as HTMLInputElement)
    .value;
  const port = (document.querySelector("input#port") as HTMLInputElement).value;
  const message = (document.querySelector(
    "textarea#message"
  ) as HTMLTextAreaElement).value;
  const sent = document.querySelector("div#sent-area") as HTMLDivElement;

  ipcRenderer.send("send", message, address, Number(port));

  sent.innerHTML += `[${address}:${port} @${(new Date).toISOString()}] ${message}</br>`;
});

document.querySelector("button#bind").addEventListener("click", () => {
  const bindAddress = (document.querySelector(
    "input#bind-address"
  ) as HTMLInputElement).value;
  const bindPort = (document.querySelector(
    "input#bind-port"
  ) as HTMLInputElement).value;

  ipcRenderer.send("bind", Number(bindPort), bindAddress);
});

document
  .querySelector("textarea#message")
  .addEventListener("keyup", (event) => {
    const count = (event.target as HTMLTextAreaElement).value.length;
    (document.querySelector("small#count") as HTMLElement).innerText =
      "count " + count;
  });

ipcRenderer.on("newmessage", (event, msg, info) => {
  const received = document.querySelector(
    "div#received-area"
  ) as HTMLDivElement;

  received.innerHTML += `[${info.address}:${info.port} @${(new Date).toISOString()}] ${msg.toString()}</br>`;
});
