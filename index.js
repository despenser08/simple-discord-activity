const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const { Client } = require("discord-rpc");
const Promise = require("bluebird");
const storage = Promise.promisifyAll(require("electron-json-storage"));

log.transports.file.level = "info";
autoUpdater.logger = log;

log.info("App starting...");

let mainWin, tray;
let RPC = new Client({ transport: "ipc" });

async function updateActivity(opts) {
  return new Promise(async (resolve) => {
    log.info("Updating RPC");

    const {
      clientId,
      title,
      desc,
      timestamp,
      imageName,
      imageDesc,
      smallImageName,
      smallImageDesc,
      button1Name,
      button1URL,
      button2Name,
      button2URL,
    } = opts;

    if (RPC.application) await RPC.destroy();
    RPC = new Client({ transport: "ipc" });

    RPC.on("ready", () => {
      let config = {
        details: title,
        state: desc,
      };

      if (timestamp) config.startTimestamp = new Date();

      if (imageName) {
        config.largeImageKey = imageName;

        if (imageDesc) config.largeImageText = imageDesc;
      }

      if (smallImageName) {
        config.smallImageKey = smallImageName;

        if (smallImageDesc) config.smallImageText = smallImageDesc;
      }

      if (button1Name && button1URL) {
        if (!config.buttons) config.buttons = [];

        config.buttons.push({ label: button1Name, url: button1URL });
      }
      if (button2Name && button2URL) {
        if (!config.buttons) config.buttons = [];

        config.buttons.push({ label: button2Name, url: button2URL });
      }

      RPC.setActivity(config, process.pid)
        .then(async () => {
          await storage.getAsync("settings", opts);
          log.info("RPC Updated");
          return resolve({ success: true, message: "Success!" });
        })
        .catch((e) => {
          log.error("Error on RPC: " + e);
          return resolve({ success: false, message: e });
        });
    });

    await RPC.login({ clientId }).catch((e) => {
      log.error("Error on RPC: " + e);
      return resolve({ success: false, message: e });
    });
  });
}

function showWindows() {
  mainWin.show();
  mainWin.focus();
  log.info("App is now visible");
}

async function createWindow() {
  mainWin = new BrowserWindow({
    width: 500,
    height: 500,
    maximizable: false,
    resizable: false,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  log.info("Created Main Window");
  Menu.setApplicationMenu(null);

  await mainWin.loadFile("loading.html");
  log.info("Loaded loading screen");

  await autoUpdater.checkForUpdatesAndNotify();

  mainWin.setResizable(true);
  await mainWin.loadFile("index.html");
  log.info("Loaded main screen");
  if (await storage.hasAsync("settings"))
    mainWin.webContents.send("set-stored-data", [
      await storage.getAsync("settings"),
    ]);
  log.info("Loaded settings");

  mainWin.on("minimize", () => {
    mainWin.hide();
    log.info("App is now hidden");
  });

  ipcMain.handle("update-activity", async (_, args) => updateActivity(args[0]));
}

app.whenReady().then(async () => {
  log.info("Creating Main Window");
  await createWindow().catch((e) =>
    log.error("Error on creating Main Window: " + e)
  );

  tray = new Tray(path.join(__dirname, "build", "icon.png"));

  const trayMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => showWindows(),
    },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ]);
  tray.setContextMenu(trayMenu);

  tray.on("double-click", () => showWindows());
});

app.on("before-quit", () => {
  if (RPC.application) RPC.destroy();
  tray.destroy();
  log.info("Quitting");
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
