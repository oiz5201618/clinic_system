document.addEventListener('DOMContentLoaded', () => {
    const addPatientForm = document.getElementById('add-patient-form');
    const addPatientMessage = document.getElementById('add-patient-message');
    const searchPatientForm = document.getElementById('search-patient-form');
    const searchResultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');
    const medicalRecordForm = document.getElementById('medical-record-form');
    const injuryPartsDiv = document.getElementById('injury-parts');
    const commonProblemsDiv = document.getElementById('common-problems');
    const medicalRecordMessage = document.getElementById('medical-record-message');

    searchResultsDiv.style.display = 'none';

    async function loadInjuryParts() {
        try {
            const injuryParts = await window.api.getInjuryParts();
            generateCheckboxes(injuryParts, injuryPartsDiv, 'injury-part');
            injuryPartsDiv.classList.add('checkbox-container'); // 確保這裡有加上 class
        } catch (error) {
            console.error('載入受傷部位失敗:', error);
            injuryPartsDiv.textContent = `載入受傷部位失敗: ${error}`;
        }
    }

    async function loadCommonProblems() {
        try {
            const commonProblems = await window.api.getCommonProblems();
            generateCheckboxes(commonProblems, commonProblemsDiv, 'common-problem');
            commonProblemsDiv.classList.add('checkbox-container'); // 確保這裡有加上 class
        } catch (error) {
            console.error('載入常見問題失敗:', error);
            commonProblemsDiv.textContent = `載入常見問題失敗: ${error}`;
        }
    }

    function generateCheckboxes(items, container, name) {
        items.forEach(item => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${name}-${item.InjuryPartID || item.CommonProblemID}`;
            checkbox.name = name;
            checkbox.value = item.InjuryPartID || item.CommonProblemID;

            const label = document.createElement('label');
            label.textContent = item.InjuryPartName || item.CommonProblemName;
            label.htmlFor = checkbox.id;
            label.classList.add('checkbox-label');

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    loadInjuryParts();
    loadCommonProblems();

    addPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;
        const phone = document.getElementById('phone').value;
        const lineid = document.getElementById('lineid').value;
        const email = document.getElementById('email').value;

        try {
            const message = await window.api.addPatient(name, birthdate, phone, lineid, email);
            addPatientMessage.textContent = message;
            addPatientForm.reset();
        } catch (error) {
            console.error('新增病人失敗:', error);
            addPatientMessage.textContent = `新增病人失敗: ${error}`;
        }
    });

    searchPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const criteria = {
            name: document.getElementById('search-name').value,
            birthdate: document.getElementById('search-birthdate').value,
            phone: document.getElementById('search-phone').value,
            lineid: document.getElementById('search-lineid').value,
            email: document.getElementById('search-email').value
        };

        try {
            const searchResults = await window.api.searchPatients(criteria);
            searchResultsList.innerHTML = '';
            if (searchResults.length > 0) {
                searchResults.forEach(patient => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        ${patient.Name} 
                        <button class="load-medical-record" data-id="${patient.PatientID}">載入病歷</button>
                        <button class="delete-patient" data-id="${patient.PatientID}">刪除</button>
                        <br>
                        (ID: ${patient.PatientID}, 生日: ${patient.Birthdate ? new Date(patient.Birthdate).toLocaleDateString() : 'N/A'}, 電話: ${patient.Phone || 'N/A'}, LineID: ${patient.LineID || 'N/A'}, Email: ${patient.Email || 'N/A'})
                    `;
                    searchResultsList.appendChild(listItem);
                });
                searchResultsDiv.style.display = 'block';

                document.querySelectorAll('.delete-patient').forEach(button => {
                    button.addEventListener('click', () => {
                        const patientId = button.dataset.id;
                        window.api.deletePatient(patientId)
                            .then(message => {
                                alert(message);
                                searchPatientForm.dispatchEvent(new Event('submit'));
                            })
                            .catch(error => {
                                console.error('刪除病人失敗:', error);
                                alert(`刪除病人失敗: ${error}`);
                            });
                    });
                });

                document.querySelectorAll('.load-medical-record').forEach(button => {
                    button.addEventListener('click', () => {
                        const patientId = button.dataset.id;
                        // 切換到病歷系統的 tab
                        document.querySelector('[data-tab="medical-records"]').click();

                        // 顯示病人 ID
                        document.getElementById('patient-id-display').value = patientId;

                        // 在這裡可以加入根據 patientId 載入病歷的邏輯
                        // 例如，如果病歷系統需要先選擇病人才能載入，
                        // 你可以在這裡設定相關的 UI 元素。
                        alert(`準備載入病人 ID ${patientId} 的病歷`);
                    });
                });

            } else {
                searchResultsList.textContent = `沒有找到符合條件的病人。`;
                searchResultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('查詢病人失敗:', error);
            searchResultsList.textContent = `查詢病人失敗: ${error}`;
            searchResultsDiv.style.display = 'block';
        }
    });

    medicalRecordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedInjuryParts = Array.from(document.querySelectorAll('input[name="injury-part"]:checked'))
            .map(checkbox => parseInt(checkbox.value));
        const selectedCommonProblems = Array.from(document.querySelectorAll('input[name="common-problem"]:checked'))
            .map(checkbox => parseInt(checkbox.value));
        const chiefComplaint = document.getElementById('chief-complaint').value;

        // 取得病人 ID
        const patientId = document.getElementById('patient-id-display').value;

        const medicalRecordData = {
            patientId: parseInt(patientId), // 確保 patientId 是數字
            details: chiefComplaint,
            injuryParts: selectedInjuryParts,
            commonProblems: selectedCommonProblems,
            recordDate: new Date() // 取得當下時間
        };

        try {
            const result = await window.api.saveMedicalRecord(medicalRecordData);
            medicalRecordMessage.textContent = result;
            medicalRecordForm.reset();
        } catch (error) {
            console.error('儲存病歷失敗:', error);
            medicalRecordMessage.textContent = `儲存病歷失敗: ${error}`;
        }
    });
});