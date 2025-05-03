document.addEventListener('DOMContentLoaded', () => {
    const addPatientForm = document.getElementById('add-patient-form');
    const addPatientMessage = document.getElementById('add-patient-message');
    const searchPatientForm = document.getElementById('search-patient-form');
    const searchResultsList = document.getElementById('search-results-list');
    const searchResultsDiv = document.getElementById('search-results');

    searchResultsDiv.style.display = 'none';

    addPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const birthdateInput = document.getElementById('birthdate');
        const phoneInput = document.getElementById('phone');
        const lineidInput = document.getElementById('lineid');
        const emailInput = document.getElementById('email');

        const name = nameInput.value;
        const birthdate = birthdateInput.value;
        const phone = phoneInput.value;
        const lineid = lineidInput.value;
        const email = emailInput.value;

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
        const name = document.getElementById('search-name').value;
        const birthdate = document.getElementById('search-birthdate').value;
        const phone = document.getElementById('search-phone').value;
        const lineid = document.getElementById('search-lineid').value;
        const email = document.getElementById('search-email').value;

        try {
            const searchResults = await window.api.searchPatients({ name, birthdate, phone, lineid, email });
            searchResultsList.innerHTML = '';
            if (searchResults.length > 0) {
                searchResults.forEach(patient => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        ${patient.Name} (ID: ${patient.PatientID}, 生日: ${patient.Birthdate ? new Date(patient.Birthdate).toLocaleDateString() : 'N/A'}, 電話: ${patient.Phone || 'N/A'}, LineID: ${patient.LineID || 'N/A'}, Email: ${patient.Email || 'N/A'})
                        <button class="edit-patient" data-id="${patient.PatientID}">編輯</button>
                        <button class="delete-patient" data-id="${patient.PatientID}">刪除</button>
                    `;
                    searchResultsList.appendChild(listItem);
                });
                searchResultsDiv.style.display = 'block';

                // 編輯和刪除按鈕的事件監聽器
                document.querySelectorAll('.edit-patient').forEach(button => {
                    button.addEventListener('click', () => {
                        const patientId = button.dataset.id;
                        // 這裡可以加入編輯病人的邏輯，例如顯示一個編輯表單
                        alert(`編輯病人 ID: ${patientId}`);
                    });
                });

                document.querySelectorAll('.delete-patient').forEach(button => {
                    button.addEventListener('click', () => {
                        const patientId = button.dataset.id;
                        if (confirm(`確定要刪除病人 ID ${patientId} 嗎？`)) {
                            window.api.deletePatient(patientId)
                                .then(message => {
                                    alert(message);
                                    searchPatientForm.dispatchEvent(new Event('submit')); // 重新執行查詢以更新列表
                                })
                                .catch(error => {
                                    console.error('刪除病人失敗:', error);
                                    alert(`刪除病人失敗: ${error}`);
                                });
                        }
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
});