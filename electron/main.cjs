const { app, BrowserWindow, Menu, Tray, clipboard, ipcMain, nativeImage, safeStorage, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFile, spawn } = require("child_process");

const devServer = process.env.PIXELPAL_DEV_SERVER;
let mainWindow;
let tray;

function secretPath() {
  return path.join(app.getPath("userData"), "secrets.json");
}

function readSecrets() {
  try {
    return JSON.parse(fs.readFileSync(secretPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeSecrets(secrets) {
  fs.mkdirSync(path.dirname(secretPath()), { recursive: true });
  fs.writeFileSync(secretPath(), JSON.stringify(secrets, null, 2));
}

function saveSecret(key, value) {
  const secrets = readSecrets();
  if (!value) {
    delete secrets[key];
    writeSecrets(secrets);
    return true;
  }
  if (safeStorage.isEncryptionAvailable()) {
    secrets[key] = {
      encrypted: true,
      value: safeStorage.encryptString(value).toString("base64"),
    };
  } else {
    secrets[key] = {
      encrypted: false,
      value,
    };
  }
  writeSecrets(secrets);
  return true;
}

function loadSecret(key) {
  const item = readSecrets()[key];
  if (!item) return "";
  try {
    if (item.encrypted) return safeStorage.decryptString(Buffer.from(item.value, "base64"));
    return item.value || "";
  } catch {
    return "";
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 260,
    height: 250,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow = win;

  win.setAlwaysOnTop(true, "floating");

  if (devServer) {
    win.loadURL(devServer);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("码伴 PixelPal");
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "显示/隐藏",
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) mainWindow.hide();
        else mainWindow.show();
      },
    },
    { type: "separator" },
    { label: "退出", click: () => app.quit() },
  ]));
}

function openApp(target) {
  const normalized = target.toLowerCase();
  const platform = process.platform;

  const macApps = {
    calculator: "Calculator",
    "计算器": "Calculator",
    notes: "Notes",
    "备忘录": "Notes",
    calendar: "Calendar",
    "日历": "Calendar",
    terminal: "Terminal",
    "终端": "Terminal",
  };

  const winCommands = {
    calculator: "calc.exe",
    "计算器": "calc.exe",
    notepad: "notepad.exe",
    "记事本": "notepad.exe",
    calendar: "outlookcal:",
    "日历": "outlookcal:",
    terminal: "wt.exe",
    "终端": "wt.exe",
  };

  return new Promise((resolve) => {
    if (platform === "darwin") {
      const appName = macApps[normalized] || target;
      execFile("open", ["-a", appName], (error) => resolve(!error));
      return;
    }

    if (platform === "win32") {
      const command = winCommands[normalized] || target;
      if (command.endsWith(":")) {
        shell.openExternal(command).then(() => resolve(true)).catch(() => resolve(false));
      } else {
        try {
          spawn(command, { detached: true, stdio: "ignore" }).unref();
          resolve(true);
        } catch {
          resolve(false);
        }
      }
      return;
    }

    resolve(false);
  });
}

function activeContext() {
  return new Promise((resolve) => {
    if (process.platform === "darwin") {
      const script = 'tell application "System Events" to get name of first application process whose frontmost is true';
      execFile("osascript", ["-e", script], (error, stdout) => {
        resolve({ app: error ? "" : stdout.trim(), title: "" });
      });
      return;
    }

    if (process.platform === "win32") {
      const ps = [
        "Add-Type @'",
        "using System;",
        "using System.Runtime.InteropServices;",
        "using System.Text;",
        "public class Win {",
        "[DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow();",
        "[DllImport(\"user32.dll\")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);",
        "}",
        "'@;",
        "$h=[Win]::GetForegroundWindow();",
        "$b=New-Object Text.StringBuilder 1024;",
        "[void][Win]::GetWindowText($h,$b,$b.Capacity);",
        "$b.ToString()",
      ].join("\n");
      execFile("powershell.exe", ["-NoProfile", "-Command", ps], (error, stdout) => {
        resolve({ app: "", title: error ? "" : stdout.trim() });
      });
      return;
    }

    resolve({ app: "", title: "" });
  });
}

ipcMain.handle("pixelpal:open-url", async (_event, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("pixelpal:open-app", async (_event, target) => {
  return openApp(String(target || ""));
});

ipcMain.handle("pixelpal:platform", () => ({
  platform: process.platform,
  home: os.homedir(),
}));

ipcMain.handle("pixelpal:active-context", () => activeContext());

ipcMain.handle("pixelpal:close", () => {
  app.quit();
});

ipcMain.handle("pixelpal:save-secret", (_event, key, value) => saveSecret(String(key), String(value || "")));

ipcMain.handle("pixelpal:load-secret", (_event, key) => loadSecret(String(key)));

ipcMain.handle("pixelpal:copy-text", (_event, text) => {
  clipboard.writeText(String(text || ""));
  return true;
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  app.quit();
});
