document.addEventListener('DOMContentLoaded', () => {
    const patientsList = document.getElementById('patients-list');
    const addPatientForm = document.getElementById('add-patient-form');
    const addPatientMessage = document.getElementById('add-patient-message');
    const searchPatientForm = document.getElementById('search-patient-form');
    const searchResultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.style.display = 'none'; // 預設隱藏查詢結果

    async function loadPatients() {
        try {
            const patients = await window.api.getPatients();
            patientsList.innerHTML = '';
            patients.forEach(patient => {
                const listItem = document.createElement('li');
                listItem.textContent = `${patient.Name} (ID: ${patient.PatientID}, 生日: ${patient.Birthdate ? new Date(patient.Birthdate).toLocaleDateString() : 'N/A'})`;
                patientsList.appendChild(listItem);
            });
        } catch (error) {
            console.error('載入病人資料失敗:', error);
            patientsList.textContent = `載入病人資料失敗: ${error}`;
        }
    }

    loadPatients();

    addPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const birthdateInput = document.getElementById('birthdate');
        const name = nameInput.value;
        const birthdate = birthdateInput.value;

        try {
            const message = await window.api.addPatient(name, birthdate);
            addPatientMessage.textContent = message;
            addPatientForm.reset();
            loadPatients(); // 重新載入病人列表
        } catch (error) {
            console.error('新增病人失敗:', error);
            addPatientMessage.textContent = `新增病人失敗: ${error}`;
        }
    });

    searchPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const searchBirthdateInput = document.getElementById('search-birthdate');
        const birthdate = searchBirthdateInput.value;

        try {
            const searchResults = await window.api.searchPatientsByBirthdate(birthdate);
            searchResultsList.innerHTML = '';
            if (searchResults.length > 0) {
                searchResults.forEach(patient => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${patient.Name} (ID: ${patient.PatientID}, 生日: ${patient.Birthdate ? new Date(patient.Birthdate).toLocaleDateString() : 'N/A'})`;
                    searchResultsList.appendChild(listItem);
                });
                searchResultsDiv.style.display = 'block';
            } else {
                searchResultsList.textContent = `沒有找到生日為 ${new Date(birthdate).toLocaleDateString()} 的病人。`;
                searchResultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('查詢病人失敗:', error);
            searchResultsList.textContent = `查詢病人失敗: ${error}`;
            searchResultsDiv.style.display = 'block';
        }
    });
});