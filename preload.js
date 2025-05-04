const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getPatients: () => ipcRenderer.invoke('get-patients'),
    addPatient: (name, birthdate, phone, lineid, email) => ipcRenderer.invoke('add-patient', name, birthdate, phone, lineid, email),
    searchPatients: (criteria) => ipcRenderer.invoke('search-patients', criteria),
    deletePatient: (id) => ipcRenderer.invoke('delete-patient', id),
    getInjuryParts: () => ipcRenderer.invoke('get-injury-parts'),
    getCommonProblems: () => ipcRenderer.invoke('get-common-problems'),
    saveMedicalRecord: (medicalRecordData) => ipcRenderer.invoke('save-medical-record', medicalRecordData),
    getMedicalRecords: (patientId) => ipcRenderer.invoke('get-medical-records', patientId)
});