import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
import Application from "./app";

if (require("electron-squirrel-startup")) {
  app.quit();
}

const menu = Menu.buildFromTemplate([
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
      label: "Documentation"
    },
    {
      id: "2.2",
      label: "Issues"
    },
    {
      id: "2.3",
      label: "About"
    },
    {type: "separator"},
    {
      id: "2.4",
      label: "Website",
      click: async () => shell.openExternal("https://ghanizadev.github.io")
    }
  ]
},
]);

Menu.setApplicationMenu(menu);

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.setResizable(false);
  mainWindow.setTitle("UDP Tester");

  Application.addEventListener((msg, info) => {
    mainWindow.webContents.send("newmessage", msg.toString(), info);
  });
};

ipcMain.on("send", (event, msg: string, address: string, port: number) => {
  Application.send(msg, address, port);
});

ipcMain.on("bind", (event, port: number, address: string) => {
  Application.bind(port, address);
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
