const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('floating', {
  getState: () => ipcRenderer.invoke('floating:state'),
  subscribe: callback => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('floating:state', listener);
    return () => ipcRenderer.removeListener('floating:state', listener);
  },
  command: command => ipcRenderer.invoke('floating:command', command),
  window: action => ipcRenderer.send('floating:window', action),
});
