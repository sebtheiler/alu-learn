import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getCurrentExtractId: async (): Promise<string> =>
    ipcRenderer.invoke("get-current-extract-id"),
});
