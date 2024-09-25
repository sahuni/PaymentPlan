let tableCount = 0; // 현재 생성된 테이블 수
const maxTables = 12; // 최대 테이블 수
let tablesData = []; // 각 테이블의 합계를 저장하는 배열

document.getElementById('createTableBtn').addEventListener('click', createTable);
document.getElementById('validateRatesBtn').addEventListener('click', validateRates);
document.getElementById('correctRatesBtn').addEventListener('click', correctRates);
document.getElementById('downloadExcelBtn').addEventListener('click', generateExcel);
document.getElementById('monthlyTaskBtn').addEventListener('click', showMonthlyTaskPopup);

// 테이블 생성
function createTable() {
    if (tableCount >= maxTables) return alert('테이블을 더 이상 추가할 수 없습니다.');

    const taskNumber = document.getElementById('taskNumber').value;
    const taskName = document.getElementById('taskName').value;
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const taskResearcherId = document.getElementById('taskResearcherId').value;
    const taskResearcherName = document.getElementById('taskResearcherName').value;
    const taskPrincipalName = document.getElementById('taskPrincipalName').value;

    if (!taskNumber || !taskName || !monthlyPayment || !startDate || !endDate || !taskResearcherId || !taskResearcherName || !taskPrincipalName) {
        return alert('모든 필드를 입력해 주세요.');
    } else if (monthlyPayment < 0) {
        return alert('금액은 0보다 작을 수 없습니다.');
    } else if (startDate > endDate) {
        return alert('시작년월은 종료년월보다 클 수 없습니다.');
    }

    const tableId = `table-${tableCount + 1}`;
    const table = generateTable(taskNumber, taskName, monthlyPayment, startDate, endDate, tableId, taskResearcherId, taskResearcherName, taskPrincipalName);
    document.getElementById('tableContainer').appendChild(table);
    tableCount++;

    // 데이터 저장
    tablesData.push({
        tableId: tableId,
        taskNumber: taskNumber,
        taskName: taskName,
        startDate: startDate,
        endDate: endDate,
        taskResearcherId: taskResearcherId,
        taskResearcherName: taskResearcherName,
        taskPrincipalName: taskPrincipalName,
        totalAmount: 0
    });

    updateTotalSum();
    updatePeriodSummary();
}

// 테이블 생성 함수
function generateTable(taskNumber, taskName, monthlyPayment, startDate, endDate, tableId, taskResearcherId, taskResearcherName, taskPrincipalName) {
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('col-4', 'mb-4');

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');
    table.id = tableId;

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th colspan="3">
                <button class="btn btn-danger btn-sm me-2" onclick="deleteTable('${tableId}')">삭제</button>
                ${taskNumber} - ${taskName}
            </th>
        </tr>
        <tr>
            <th>기간</th>
            <th>월지급액</th>
            <th>계상률 (%)</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    let start = new Date(startDate);
    let end = new Date(endDate);
    let totalAmount = 0;

    while (start <= end) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}
                <input type="hidden" class="form-control taskNumber" value="${taskNumber}">
                <input type="hidden" class="form-control taskName" value="${taskName}">
                <input type="hidden" class="form-control taskResearcherId" value="${taskResearcherId}">
                <input type="hidden" class="form-control taskResearcherName" value="${taskResearcherName}">
                <input type="hidden" class="form-control taskPrincipalName" value="${taskPrincipalName}">
            </td>
            <td><input type="number" class="form-control paymentInput" value="${Math.round(monthlyPayment)}"></td>
            <td><input type="text" class="form-control ratioInput" readonly></td>
        `;
        tbody.appendChild(row);

        totalAmount += Math.round(monthlyPayment);
        start.setMonth(start.getMonth() + 1);
    }

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td>합계</td>
        <td id="total-${tableId}">${totalAmount}</td>
        <td></td>
    `;
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    tableWrapper.addEventListener('input', function(event) {
        if (event.target.classList.contains('paymentInput')) {
            updateTableSum(tableId);
            updateTotalSum();
        }
    });

    tablesData.push({ tableId, taskNumber, taskName, totalAmount, startDate, endDate, taskResearcherId, taskResearcherName, taskPrincipalName });

    return tableWrapper;
}

// 특정 테이블의 합계 업데이트
function updateTableSum(tableId) {
    const table = document.getElementById(tableId);
    const paymentInputs = table.querySelectorAll('.paymentInput');
    let total = 0;

    paymentInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += value;
    });

    const totalCell = table.querySelector(`#total-${tableId}`);
    totalCell.textContent = total;

    const tableData = tablesData.find(t => t.tableId === tableId);
    tableData.totalAmount = total;

    updateTotalSum();
}

// 총합 및 계상률 업데이트 함수 (기간별 총합으로 변경)
function updateTotalSum() {
    const dateMap = {};

    tablesData.forEach(data => {
        const table = document.getElementById(data.tableId);
        const paymentInputs = table.querySelectorAll('.paymentInput');
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let date = new Date(start);
        let i = 0;
        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const payment = parseFloat(paymentInputs[i].value) || 0;

            if (!dateMap[yearMonth]) {
                dateMap[yearMonth] = 0;
            }
            dateMap[yearMonth] += payment;

            date.setMonth(date.getMonth() + 1);
            i++;
        }
    });

    tablesData.forEach(data => {
        const table = document.getElementById(data.tableId);
        const paymentInputs = table.querySelectorAll('.paymentInput');
        const ratioInputs = table.querySelectorAll('.ratioInput');

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let date = new Date(start);
        let i = 0;
        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const payment = parseFloat(paymentInputs[i].value) || 0;
            const periodTotal = (dateMap[yearMonth] / 2) || 1;

            const ratio = periodTotal > 0 ? ((payment / periodTotal) * 100).toFixed(2) : 0;
            ratioInputs[i].value = ratio + '%';

            date.setMonth(date.getMonth() + 1);
            i++;
        }
    });
}

// 테이블 삭제 함수
function deleteTable(tableId) {
    const table = document.getElementById(tableId).closest('.col-4');
    table.remove();

    tablesData = tablesData.filter(data => data.tableId !== tableId);

    updateTotalSum();
    updatePeriodSummary();
}

// 검증 버튼을 눌렀을 때 팝업을 띄우고, 각 기간별 계상률 합을 보여줌
function validateRates() {
    document.getElementById("downloadExcelBtn").disabled = false;

    const dateMap = {};

    tablesData.forEach(data => {
        const table = document.getElementById(data.tableId);
        const ratioInputs = table.querySelectorAll('.ratioInput');
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let date = new Date(start);
        let i = 0;
        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const ratio = parseFloat(ratioInputs[i].value) || 0;

            if (!dateMap[yearMonth]) {
                dateMap[yearMonth] = 0;
            }
            dateMap[yearMonth] += ratio;

            date.setMonth(date.getMonth() + 1);
            i++;
        }
    });

    let popupContent = '<h3>계상률 검증 결과</h3><ul>';
    const sortedDates = Object.keys(dateMap).sort();
    sortedDates.forEach(date => {
        const totalRatio = dateMap[date].toFixed(2) / 2;
        popupContent += `<li>${date}: ${totalRatio}% ${totalRatio != 100 ? '(오류)' : '(정상)'}</li>`;
    });
    popupContent += '</ul>';

    const popup = window.open('', '계상률 검증', 'width=400,height=400');
    popup.document.write(`
        <html>
            <head>
                <title>계상률 검증</title>
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="p-3">
                <div class="container">
                    ${popupContent}
                </div>
            </body>
        </html>
    `);
    popup.document.close();
}

// 보정 버튼을 눌렀을 때 계상률 보정 함수
function correctRates() {
    const dateMap = {};

    tablesData.forEach(data => {
        const table = document.getElementById(data.tableId);
        const ratioInputs = table.querySelectorAll('.ratioInput');
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let date = new Date(start);
        let i = 0;
        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const ratio = parseFloat(ratioInputs[i].value) || 0;

            if (!dateMap[yearMonth]) {
                dateMap[yearMonth] = 0;
            }
            dateMap[yearMonth] += ratio;

            date.setMonth(date.getMonth() + 1);
            i++;
        }
    });

    const sortedDates = Object.keys(dateMap).sort();
    let firstPeriod = null;
    sortedDates.forEach(date => {
        if (dateMap[date] !== 100 && firstPeriod === null) {
            firstPeriod = date;
        }
    });

    if (firstPeriod) {
        const totalRatio = dateMap[firstPeriod];

        let targetTable = null;
        let targetInput = null;
        tablesData.forEach(data => {
            const table = document.getElementById(data.tableId);
            const ratioInputs = table.querySelectorAll('.ratioInput');
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            let date = new Date(start);
            let i = 0;
            while (date <= end) {
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (yearMonth === firstPeriod) {
                    targetTable = table;
                    targetInput = ratioInputs[i];
                    break;
                }
                date.setMonth(date.getMonth() + 1);
                i++;
            }

            if (targetTable) {
                return;
            }
        });

        if (targetInput && totalRatio !== 100) {
            const correction = (totalRatio > 100) ? (totalRatio - 100) : (100 - totalRatio);
            let firstRatio = parseFloat(targetInput.value) || 0;

            if (totalRatio > 100) {
                firstRatio -= correction;
            } else {
                firstRatio += correction;
            }

            targetInput.value = firstRatio.toFixed(2) + '%';
        }
    }
    
    alert('검증에서 오류가 없을때까지 보정해주세요.');
    validateRates();
}

// "월별/과제별" 버튼 이벤트 리스너
function showMonthlyTaskPopup() {
    const popup = window.open('', '월별/과제별', 'width=800,height=600');
    
    const allData = tablesData.map(data => {
        const table = document.getElementById(data.tableId);
        const monthlyPayments = table.querySelectorAll('.paymentInput');
        const ratios = table.querySelectorAll('.ratioInput');

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let date = new Date(start);
        let i = 0;
        const taskData = [];

        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            taskData.push({
                yearMonth: yearMonth,
                taskNumber: data.taskNumber,
                ratio: ratios[i].value
            });
            date.setMonth(date.getMonth() + 1);
            i++;
        }

        return taskData;
    }).flat();

    const uniqueDates = [...new Set(allData.map(d => d.yearMonth))];
    const uniqueTasks = [...new Set(allData.map(d => d.taskNumber))];

    let popupContent = '<html><head><title>월별/과제별 계상률</title>';
    popupContent += '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet"></head>';
    popupContent += '<body class="p-3"><div class="container">';
    popupContent += '<h3>월별/과제별 계상률</h3>';
    popupContent += '<table class="table table-bordered table-hover"><thead><tr><th>기간</th>';

    uniqueTasks.forEach(task => {
        popupContent += `<th>${task}</th>`;
    });
    
    popupContent += '</tr></thead><tbody>';

    uniqueDates.forEach(date => {
        popupContent += `<tr><td>${date}</td>`;
        uniqueTasks.forEach(task => {
            const data = allData.find(d => d.yearMonth === date && d.taskNumber === task);
            const ratioValue = data ? data.ratio : 'N/A';
            popupContent += `<td>${ratioValue}</td>`;
        });
        popupContent += '</tr>';
    });

    popupContent += '</tbody></table></div></body></html>';

    popup.document.write(popupContent);
    popup.document.close();
}
