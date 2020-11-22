import "bootstrap";
import "../public/index.css";
import { ipcRenderer } from "electron";

//#region Elements Cache
const alert = document.querySelector("#alert");

const sentMessageBox = document.querySelector<HTMLDivElement>("div#sent-area");

const bindButton = document.querySelector<HTMLButtonElement>("button#bind");
const bindAddress = document.querySelector<HTMLInputElement>("input#bind-address");
const bindPort = document.querySelector<HTMLInputElement>("input#bind-port");

const clientASCII = document.querySelector<HTMLInputElement>("input#client-ascii");
const clientHEX = document.querySelector<HTMLInputElement>("input#client-hex");
const clientBase64 = document.querySelector<HTMLInputElement>("input#client-base64");
const clientPayload = document.querySelector<HTMLTextAreaElement>("textarea#message")
const clientSendButton = document.querySelector<HTMLButtonElement>("button#send");

const clientForm = document.forms.namedItem("client-form");
const serverForm = document.forms.namedItem("server-form");
//#endregion

//#region Global variables
let previousEncoding : BufferEncoding = "ascii";
//#endregion

//#region Methods
const getBody = (form: HTMLFormElement) => {
  const body: any = {};

  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i];

    switch (element.tagName.toLowerCase()) {
      case "textarea":
        {
          const e = element as HTMLTextAreaElement;
          body[e.name] = e.value;
        }
        break;
      case "input":
        {
          const e = element as HTMLInputElement;

          if (e.type === "radio") {
            if (e.checked) body[e.name] = e.value;
          } else body[e.name] = e.value;
        }
        break;
    }
  }
  return body;
};

const changeClientFormat = (event : any) => {
  const input = event.target;
  if(!input.checked) return;
  const e = document.querySelector<HTMLTextAreaElement>("textarea#message");

  const result = input.value;

  switch (result) {
    case "hex":
      e.value = Buffer.from(e.value, previousEncoding).toString("hex");
      previousEncoding = "hex";
      break;
    case "base64":
      e.value = Buffer.from(e.value, previousEncoding).toString("base64");
      previousEncoding = "base64";
      break;
    case "ascii":
      e.value = Buffer.from(e.value, previousEncoding).toString("utf8");
      previousEncoding = "utf8";
      break;
    default:
      break;
  }
};

const bindConnect = () => {
  const { port, address } = getBody(serverForm);
  ipcRenderer.send("bind", Number(port), address);
};

const bindDisconnect = () => {
  ipcRenderer.send("unbind");
};
//#endregion

//#region Event listeners
ipcRenderer.on("sent-message", (event, message, address, port) => {
  sentMessageBox.innerHTML += `[${address}:${port} @${new Date().toISOString()}] ${message}</br>`;
});

ipcRenderer.on("server-opened", () => {
  bindButton.classList.remove("btn-primary");
  bindButton.classList.add("btn-danger");
  bindButton.innerText = "Close";

  bindAddress.disabled = true;
  bindPort.disabled = true;

  bindButton.removeEventListener("click", bindConnect);
  bindButton.addEventListener("click", bindDisconnect);
});

ipcRenderer.on("server-closed", () => {
  bindButton.classList.remove("btn-danger");
  bindButton.classList.add("btn-primary");
  bindButton.innerText = "Bind";

  bindAddress.disabled = false;
  bindPort.disabled = false;

  bindButton.removeEventListener("click", bindDisconnect);
  bindButton.addEventListener("click", bindConnect);
});

ipcRenderer.on("about", () => {
  const element = document.querySelector<HTMLButtonElement>(
    "button#about-toggle"
  );
  if (element) return element.click();

  const button = document.createElement("button");
  button.style.display = "none";
  button.setAttribute("data-toggle", "modal");
  button.setAttribute("data-target", "#about-modal");
  button.id = "about-toggle";
  document.body.appendChild(button);
  button.click();
});

ipcRenderer.on("newmessage", (event, msg, info) => {
  const received = document.querySelector(
    "div#received-area"
  ) as HTMLDivElement;

  received.innerHTML += `[${info.address}:${
    info.port
  } @${new Date().toISOString()}] ${msg.toString()}</br>`;
});

ipcRenderer.on("alert", (event, type, message) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("alert", "alert-dismissible", "fade");
  wrapper.setAttribute("role", "alert");

  const title = document.createElement("strong");
  const content = document.createTextNode(message);

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("close");
  button.setAttribute("data-dismiss", "alert");
  button.setAttribute("aria-label", "Close");

  const span = document.createElement("span");
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = "&times;";

  button.appendChild(span);
  wrapper.appendChild(button);
  wrapper.appendChild(title);
  wrapper.appendChild(content);

  switch (type) {
    case "error":
      title.innerText = "Error: ";
      wrapper.classList.add("alert-danger", "show");
      break;
    case "warning":
      title.innerText = "Attention: ";
      wrapper.classList.add("alert-warning", "show");
      break;
    case "success":
      wrapper.classList.add("alert-success", "show");
      title.innerText = "Success! ";
      break;
    default:
      wrapper.classList.add("alert-info", "show");
      title.innerText = "Info: ";
      break;
  }

  alert.appendChild(wrapper);
});
//#endregion

//#region Document Listeners
clientASCII.addEventListener("change", changeClientFormat);

clientHEX.addEventListener("change", changeClientFormat);

clientBase64.addEventListener("change", changeClientFormat);

clientPayload.addEventListener("keyup", (event) => {
  const element = event.target as HTMLTextAreaElement;
  const count = Buffer.from(element.value).length;
  const counting = `count ${count} (${new TextEncoder().encode(element.value).length} bytes)`;
  document.querySelector<HTMLElement>("small#count").innerText = counting;
});
  
clientSendButton.addEventListener("click", () => {
  const { payload, address, port } = getBody(clientForm);
  ipcRenderer.send("send", payload, address, Number(port));
});

bindButton.addEventListener("click", bindConnect);
//#endregion