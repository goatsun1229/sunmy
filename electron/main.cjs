const { app, BrowserWindow, Menu, Tray, clipboard, ipcMain, nativeImage, safeStorage, screen, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFile, spawn } = require("child_process");

const devServer = process.env.PIXELPAL_DEV_SERVER;
let mainWindow;
let tray;
let hiddenEdge = null;
let visibleBounds = null;
let saveBoundsTimer = null;

const productPages = {
  home: "https://goatsun1229.github.io/sunmy/",
  download: "https://goatsun1229.github.io/sunmy/",
  privacy: "https://goatsun1229.github.io/sunmy/privacy.html",
  terms: "https://goatsun1229.github.io/sunmy/terms.html",
  feedback: "https://goatsun1229.github.io/sunmy/feedback.html",
  release: "https://github.com/goatsun1229/sunmy/releases",
};

function secretPath() {
  return path.join(app.getPath("userData"), "secrets.json");
}

function windowStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function readWindowState() {
  try {
    return JSON.parse(fs.readFileSync(windowStatePath(), "utf8"));
  } catch {
    return {};
  }
}

function saveWindowState(bounds) {
  fs.mkdirSync(path.dirname(windowStatePath()), { recursive: true });
  fs.writeFileSync(windowStatePath(), JSON.stringify({ bounds }, null, 2));
}

function scheduleSaveBounds(bounds) {
  if (hiddenEdge) return;
  if (saveBoundsTimer) clearTimeout(saveBoundsTimer);
  saveBoundsTimer = setTimeout(() => saveWindowState(bounds), 300);
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
  const saved = readWindowState().bounds || {};
  const win = new BrowserWindow({
    x: Number.isFinite(saved.x) ? saved.x : undefined,
    y: Number.isFinite(saved.y) ? saved.y : undefined,
    width: 380,
    height: 420,
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
  win.on("move", () => {
    if (!hiddenEdge) {
      visibleBounds = win.getBounds();
      scheduleSaveBounds(visibleBounds);
    }
  });

  if (devServer) {
    win.loadURL(devServer);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  win.webContents.on("context-menu", () => {
    Menu.buildFromTemplate([
      { label: "关于码伴 PixelPal", click: () => shell.openExternal(productPages.home) },
      { label: "检查更新", click: () => shell.openExternal(productPages.release) },
      { type: "separator" },
      { label: "隐私政策", click: () => shell.openExternal(productPages.privacy) },
      { label: "用户协议", click: () => shell.openExternal(productPages.terms) },
      { label: "反馈方式", click: () => shell.openExternal(productPages.feedback) },
      { type: "separator" },
      { label: "退出", click: () => app.quit() },
    ]).popup({ window: win });
  });
}

function nearestDisplayWorkArea(bounds) {
  return screen.getDisplayMatching(bounds).workArea;
}

function edgeForBounds(bounds) {
  const area = nearestDisplayWorkArea(bounds);
  const margin = 18;
  if (bounds.x <= area.x + margin) return "left";
  if (bounds.x + bounds.width >= area.x + area.width - margin) return "right";
  if (bounds.y <= area.y + margin) return "top";
  if (bounds.y + bounds.height >= area.y + area.height - margin) return "bottom";
  return null;
}

function hiddenBounds(bounds, edge) {
  const area = nearestDisplayWorkArea(bounds);
  const peek = 56;
  const next = { ...bounds };
  if (edge === "left") next.x = area.x - bounds.width + peek;
  if (edge === "right") next.x = area.x + area.width - peek;
  if (edge === "top") next.y = area.y - bounds.height + peek;
  if (edge === "bottom") next.y = area.y + area.height - peek;
  return next;
}

function revealBounds(bounds, edge) {
  const area = nearestDisplayWorkArea(bounds);
  const next = { ...bounds };
  if (edge === "left") next.x = area.x + 8;
  if (edge === "right") next.x = area.x + area.width - bounds.width - 8;
  if (edge === "top") next.y = area.y + 8;
  if (edge === "bottom") next.y = area.y + area.height - bounds.height - 8;
  return next;
}

function setEdgeHidden(edge) {
  if (!mainWindow) return { hidden: false, edge: null };
  const bounds = mainWindow.getBounds();
  if (!edge) {
    hiddenEdge = null;
    return { hidden: false, edge: null };
  }
  hiddenEdge = edge;
  visibleBounds = bounds;
  saveWindowState(bounds);
  mainWindow.setBounds(hiddenBounds(bounds, edge), true);
  return { hidden: true, edge };
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
    notes: "notepad.exe",
    "备忘录": "notepad.exe",
    calendar: "outlookcal:",
    "日历": "outlookcal:",
    terminal: "wt.exe",
    "终端": "wt.exe",
    powershell: "powershell.exe",
    "命令行": "cmd.exe",
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
        "[DllImport(\"user32.dll\")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);",
        "}",
        "'@;",
        "$h=[Win]::GetForegroundWindow();",
        "$b=New-Object Text.StringBuilder 1024;",
        "[void][Win]::GetWindowText($h,$b,$b.Capacity);",
        "$pid=0;",
        "[void][Win]::GetWindowThreadProcessId($h,[ref]$pid);",
        "$p=Get-Process -Id $pid -ErrorAction SilentlyContinue;",
        "$name=if ($p) { $p.ProcessName } else { '' };",
        "$title=$b.ToString();",
        "ConvertTo-Json @{ app=$name; title=$title } -Compress",
      ].join("\n");
      execFile("powershell.exe", ["-NoProfile", "-Command", ps], (error, stdout) => {
        if (error) {
          resolve({ app: "", title: "" });
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          resolve({ app: "", title: stdout.trim() });
        }
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

ipcMain.handle("pixelpal:open-product-page", async (_event, page) => {
  const url = productPages[String(page || "home")] || productPages.home;
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("pixelpal:product-info", () => ({
  name: app.getName(),
  version: app.getVersion(),
  pages: productPages,
}));

ipcMain.handle("pixelpal:open-app", async (_event, target) => {
  return openApp(String(target || ""));
});

ipcMain.handle("pixelpal:platform", () => ({
  platform: process.platform,
  home: os.homedir(),
}));

ipcMain.handle("pixelpal:active-context", () => activeContext());

ipcMain.handle("pixelpal:snap-edge", () => {
  if (!mainWindow) return { hidden: false, edge: null };
  const bounds = mainWindow.getBounds();
  return setEdgeHidden(edgeForBounds(bounds));
});

ipcMain.handle("pixelpal:reveal-edge", () => {
  if (!mainWindow || !hiddenEdge) return { hidden: false, edge: null };
  const edge = hiddenEdge;
  const bounds = visibleBounds || mainWindow.getBounds();
  hiddenEdge = null;
  const next = revealBounds(bounds, edge);
  mainWindow.setBounds(next, true);
  saveWindowState(next);
  return { hidden: false, edge: null };
});

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
