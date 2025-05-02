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

    // mainWindow.webContents.openDevTools();

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
    server: 'your_server_ip_or_name',
    authentication: {
        type: 'default',
        options: {
            userName: 'your_sql_server_username',
            password: 'your_sql_server_password'
        }
    },
    database: 'clinic_db',
    options: {
        encrypt: false, // 根據你的 SQL Server 配置
        trustServerCertificate: true // 在開發環境中可能需要
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
                const request = new Tedious.Request("SELECT PatientID, Name, Birthdate FROM Patients", (err, rowCount) => {
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

ipcMain.handle('add-patient', async (event, name, birthdate) => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (add-patient):', err);
                reject(err.message);
            } else {
                const request = new Tedious.Request(
                    "INSERT INTO Patients (Name, Birthdate) VALUES (@Name, @Birthdate); SELECT SCOPE_IDENTITY() AS PatientID;",
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

                connection.execSql(request);
            }
        });

        connection.connect();
    });
});

ipcMain.handle('search-patients-by-birthdate', async (event, birthdate) => {
    return new Promise((resolve, reject) => {
        const connection = new Tedious.Connection(dbConfig);

        connection.on('connect', (err) => {
            if (err) {
                console.error('連接錯誤 (search-by-birthdate):', err);
                reject(err.message);
            } else {
                const patients = [];
                const request = new Tedious.Request(
                    "SELECT PatientID, Name, Birthdate FROM Patients WHERE Birthdate = @Birthdate",
                    (err, rowCount) => {
                        if (err) {
                            console.error('查詢錯誤 (search-by-birthdate):', err);
                            reject(err.message);
                        } else {
                            connection.close();
                            resolve(patients);
                        }
                    }
                );

                request.addParameter('Birthdate', Tedious.TYPES.Date, birthdate);

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