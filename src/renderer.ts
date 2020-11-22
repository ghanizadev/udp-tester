import "bootstrap";
import "./index.css";
import { ipcRenderer } from "electron";

const alert = document.querySelector("#alert");

const bindButton = document.querySelector<HTMLButtonElement>("button#bind");
const bindAddress = document.querySelector<HTMLInputElement>("input#bind-address");
const bindPort = document.querySelector<HTMLInputElement>("input#bind-port");

const bindConnect = () => {
  const address = bindAddress.value;
  const port = bindPort.value;

  ipcRenderer.send("bind", Number(port), address);
}

const bindDisconnect = () => {
  ipcRenderer.send("unbind");
}

document.querySelector("button#send").addEventListener("click", () => {
  const address = (document.querySelector("input#address") as HTMLInputElement)
    .value;
  const port = (document.querySelector("input#port") as HTMLInputElement).value;
  const message = (document.querySelector(
    "textarea#message"
  ) as HTMLTextAreaElement).value;
  const sent = document.querySelector("div#sent-area") as HTMLDivElement;

  ipcRenderer.send("send", message, address, Number(port));

  sent.innerHTML += `[${address}:${port} @${new Date().toISOString()}] ${message}</br>`;
});

bindButton.addEventListener("click", bindConnect);

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

document
  .querySelector("textarea#message")
  .addEventListener("keyup", (event) => {
    const element = event.target as HTMLTextAreaElement;
    const count = element.value.length;
    (document.querySelector(
      "small#count"
    ) as HTMLElement).innerText = `count ${count} (${
      new TextEncoder().encode(element.value).length
    } bytes)`;
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
