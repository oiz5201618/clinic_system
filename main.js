const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Tedious = require('tedious');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const dbConfig = {
    server: 'DESKTOP-RN3BJEI\\SQLEXPRESS',
    authentication: {
        type: 'default',
        options: {
            userName: 'ShaoHua',
            password: '1234567778'
        }
    },
    options: {
        database: 'clinic_db',
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 10000
    }
};

ipcMain.handle('get-patients', async () => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (get-patients):', err);
                reject(err.message);
            } else {
                const patients = [];
                const request = new Tedious.Request("SELECT PatientID, Name, Birthdate, Phone, LineID, Email FROM Patients", (err, rowCount) => {
                    if (err) {
                        console.error('查詢錯誤 (get-patients):', err);
                        reject(err.message);
                    } else {
                        connection.close();
                        resolve(patients);
                    }
                });

                request.on('row', (columns) => {
                    const patient = {};
                    columns.forEach((column) => {
                        patient[column.metadata.colName] = column.value;
                    });
                    patients.push(patient);
                });

                connection.execSql(request);
            }
        });

        connection.connect();
    });
});

ipcMain.handle('add-patient', async (event, name, birthdate, phone, lineid, email) => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (add-patient):', err);
                reject(err.message);
            } else {
                const request = new Tedious.Request(
                    "INSERT INTO Patients (Name, Birthdate, Phone, LineID, Email) VALUES (@Name, @Birthdate, @Phone, @LineID, @Email); SELECT SCOPE_IDENTITY() AS PatientID;",
                    (err, rowCount) => {
                        if (err) {
                            console.error('查詢錯誤 (add-patient):', err);
                            reject(err.message);
                        } else {
                            let patientId;
                            request.on('returnValue', (parameterName, value) => {
                                if (parameterName === 'PatientID') {
                                    patientId = value;
                                }
                            });
                            request.on('requestCompleted', () => {
                                connection.close();
                                resolve(`成功新增病人，ID 為: ${patientId}`);
                            });
                        }
                    }
                );

                request.addParameter('Name', Tedious.TYPES.NVarChar, name);
                request.addParameter('Birthdate', Tedious.TYPES.Date, birthdate);
                request.addParameter('Phone', Tedious.TYPES.NVarChar, phone);
                request.addParameter('LineID', Tedious.TYPES.NVarChar, lineid);
                request.addParameter('Email', Tedious.TYPES.NVarChar, email);

                connection.execSql(request);
            }
        });

        connection.connect();
    });
});

ipcMain.handle('search-patients', async (event, criteria) => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (search-patients):', err);
                reject(err.message);
            } else {
                let sql = "SELECT PatientID, Name, Birthdate, Phone, LineID, Email FROM Patients WHERE 1=1";
                const parameters = [];

                if (criteria.name) {
                    sql += " AND Name LIKE @Name";
                    parameters.push({ name: 'Name', type: Tedious.TYPES.NVarChar, value: `%${criteria.name}%` });
                }
                if (criteria.birthdate) {
                    sql += " AND Birthdate = @Birthdate";
                    parameters.push({ name: 'Birthdate', type: Tedious.TYPES.Date, value: criteria.birthdate });
                }
                if (criteria.phone) {
                    sql += " AND Phone = @Phone";
                    parameters.push({ name: 'Phone', type: Tedious.TYPES.NVarChar, value: criteria.phone });
                }
                if (criteria.lineid) {
                    sql += " AND LineID = @LineID";
                    parameters.push({ name: 'LineID', type: Tedious.TYPES.NVarChar, value: criteria.lineid });
                }
                if (criteria.email) {
                    sql += " AND Email = @Email";
                    parameters.push({ name: 'Email', type: Tedious.TYPES.NVarChar, value: criteria.email });
                }

                const patients = [];
                const request = new Tedious.Request(sql, (err, rowCount) => {
                    if (err) {
                        console.error('查詢錯誤 (search-patients):', err);
                        reject(err.message);
                    } else {
                        connection.close();
                        resolve(patients);
                    }
                });

                parameters.forEach(param => request.addParameter(param.name, param.type, param.value));

                request.on('row', (columns) => {
                    const patient = {};
                    columns.forEach((column) => {
                        patient[column.metadata.colName] = column.value;
                    });
                    patients.push(patient);
                });

                connection.execSql(request);
            }
        });

        connection.connect();
    });
});

ipcMain.handle('delete-patient', async (event, id) => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (delete-patient):', err);
                reject(err.message);
            } else {
                const request = new Tedious.Request(
                    "DELETE FROM Patients WHERE PatientID = @PatientID",
                    (err, rowCount) => {
                        if (err) {
                            console.error('刪除病人錯誤:', err);
                            reject(err.message);
                        } else {
                            connection.close();
                            resolve(`成功刪除病人，ID 為: ${id}`);
                        }
                    }
                );

                request.addParameter('PatientID', Tedious.TYPES.Int, id);

                connection.execSql(request);
            }
        });

        connection.connect();
    });
});