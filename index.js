const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { Client } = require("discord-rpc");

let RPC = new Client({ transport: "ipc" });

async function updateActivity(
  clientId,
  { title, desc, timestamp },
  { imageName, imageDesc },
  { smallImageName, smallImageDesc },
  { button1Name, button1URL },
  { button2Name, button2URL }
) {
  return new Promise(async (resolve) => {
    if (RPC.application) await RPC.destroy();
    RPC = new Client({ transport: "ipc" });

    RPC.on("ready", () => {
      let config = {
        details: title,
        state: desc,
        largeImageKey: imageName,
        largeImageText: imageDesc,
        smallImageKey: smallImageName,
        smallImageText: smallImageDesc,
      };

      if (timestamp) config.startTimestamp = new Date();

      if (button1Name && button1URL) {
        if (!config.buttons) config.buttons = [];

        config.buttons.push({ label: button1Name, url: button1URL });
      }
      if (button2Name && button2URL) {
        if (!config.buttons) config.buttons = [];

        config.buttons.push({ label: button2Name, url: button2URL });
      }

      RPC.setActivity(config, process.pid)
        .then(() => resolve({ success: true, message: "Success!" }))
        .catch((e) => resolve({ success: false, message: e }));
    });

    await RPC.login({ clientId }).catch((e) =>
      resolve({ success: false, message: e })
    );
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 475,
    height: 500,
    icon: path.join(__dirname, "assets", "Discord.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  Menu.setApplicationMenu(null);

  win.loadFile("index.html");

  ipcMain.handle("update-activity", async (_, args) =>
    updateActivity(args[0], args[1], args[2], args[3], args[4], args[5])
  );
}

app.whenReady().then(createWindow);

app.on("before-quit", () => {
  if (RPC.application) RPC.destroy();
});

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
