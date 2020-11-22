import Application from "./App";
import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

if (require("electron-squirrel-startup")) {
  app.quit();
}

const template = [
  {
    id: "1",
    label: "File",
    submenu: [
      {
        id: "1.1",
        label: "Exit",
        role: "quit",
      },
    ],
  },
  { type: "separator" },
  {
    id: "2",
    label: "Help",
    submenu: [
      {
        id: "2.1",
        label: "Documentation",
        click: async () =>
          shell.openExternal(
            "https://github.com/ghanizadev/udp-tester/blob/master/README.md"
          ),
      },
      {
        id: "2.2",
        label: "Issues",
        click: async () =>
          shell.openExternal("https://github.com/ghanizadev/udp-tester/issues"),
      },
      {
        id: "2.3",
        label: "About",
        click: async () => mainWindow.webContents.send("about"),
      },
      { type: "separator" },
      {
        id: "2.4",
        label: "Website",
        click: async () => shell.openExternal("https://ghanizadev.github.io"),
      },
    ],
  },
];

if (process.env.NODE_ENV === "development") {
  template.push({
    id: "3",
    label: "Development",
    submenu: [
      {
        id: "3.1",
        label: "Force Reload",
        role: "forceReload",
      },
      {
        id: "3.2",
        label: "Toggle DevTools",
        role: "toggleDevTools",
      },
    ],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const menu = Menu.buildFromTemplate(template as any);

Menu.setApplicationMenu(menu);
let mainWindow: BrowserWindow;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.setResizable(false);
  mainWindow.setTitle("UDP Tester");

  Application.addEventListener("message", (msg, info) => {
    mainWindow.webContents.send("newmessage", msg.toString(), info);
  });

  Application.addEventListener("alert", (type, message) => {
    mainWindow.webContents.send("alert", type, message);
  });
};

ipcMain.on("send", (event, msg: string, address: string, port: number) => {
  Application.send(msg, address, port);
});

ipcMain.on("bind", async (event, port: number, address: string) => {
  if(await Application.bind(port, address))
    event.sender.send("server-opened");
});

ipcMain.on("unbind", (event) => {
  Application.unbind();
  event.sender.send("server-closed");
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
