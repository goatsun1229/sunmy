const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pixelpal", {
  openUrl: (url) => ipcRenderer.invoke("pixelpal:open-url", url),
  openApp: (target) => ipcRenderer.invoke("pixelpal:open-app", target),
  platform: () => ipcRenderer.invoke("pixelpal:platform"),
  activeContext: () => ipcRenderer.invoke("pixelpal:active-context"),
  snapEdge: () => ipcRenderer.invoke("pixelpal:snap-edge"),
  revealEdge: () => ipcRenderer.invoke("pixelpal:reveal-edge"),
  saveSecret: (key, value) => ipcRenderer.invoke("pixelpal:save-secret", key, value),
  loadSecret: (key) => ipcRenderer.invoke("pixelpal:load-secret", key),
  copyText: (text) => ipcRenderer.invoke("pixelpal:copy-text", text),
  close: () => ipcRenderer.invoke("pixelpal:close"),
});
