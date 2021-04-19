const { app, BrowserWindow, ipcMain } = require("electron");
const { Client } = require("discord-rpc");

let RPC;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  ipcMain.handle("change-activity", async (e, args) => {
    return new Promise(async (resolve) => {
      const [clientId, title, desc, timestamp, imageName, imageDesc] = args;

      if (RPC) await RPC.destroy();

      RPC = new Client({ transport: "ipc" });

      RPC.on("ready", () => {
        let config = {
          details: title,
          state: desc,
          largeImageKey: imageName,
          largeImageText: imageDesc,
        };

        if (timestamp) config.startTimestamp = new Date();

        RPC.setActivity(config).then(() =>
          resolve({ success: true, message: "Success!" })
        );
      });

      RPC.login({ clientId, scopes: ["rpc", "rpc.api"] }).catch((e) =>
        resolve({ success: false, message: e })
      );
    });
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (RPC) RPC.destroy();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
