const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeBridge('api', {
    getPatients: () => ipcRenderer.invoke('get-patients'),
    addPatient: (name, birthdate) => ipcRenderer.invoke('add-patient', name, birthdate),
    searchPatientsByBirthdate: (birthdate) => ipcRenderer.invoke('search-patients-by-birthdate', birthdate),
});