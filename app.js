let tableCount = 0; // 현재 생성된 테이블 수
const maxTables = 12; // 최대 테이블 수
let tablesData = []; // 각 테이블의 합계를 저장하는 배열

document.getElementById('createTableBtn').addEventListener('click', createTable);
document.getElementById('validateRatesBtn').addEventListener('click', validateRates);
document.getElementById('correctRatesBtn').addEventListener('click', correctRates);
document.getElementById('downloadExcelBtn').addEventListener('click', generateExcel);
document.getElementById('printlBtn').addEventListener('click', printWindow);
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
    const taskAssignName = document.getElementById('taskAssignName').value;
    
    //console.log(taskNumber + " - " + taskName + " - " + monthlyPayment + " - " + startDate + " - " + endDate + " - " + taskResearcherId + " - " + taskResearcherName + " - " + taskPrincipalName + " - " + taskAssignName);

    if (!taskNumber || !taskName || !monthlyPayment || !startDate || !endDate || !taskResearcherId || !taskResearcherName || !taskPrincipalName || !taskAssignName) {
        return alert('모든 필드를 입력해 주세요.');
    } else if (monthlyPayment < 0 ) {
    	return alert('금액은 0보다 작을 수 없습니다.');	
    } else if (startDate > endDate ) {
    	return alert('시작년월은 종료년월보다 작을 수 없습니다.');	
    }

    const tableId = `table-${tableCount + 1}`;
    const table = generateTable(taskNumber, taskName, monthlyPayment, startDate, endDate, tableId, taskResearcherId, taskResearcherName, taskPrincipalName, taskAssignName);
    document.getElementById('tableContainer').appendChild(table);
    tableCount++;
    
    // 올바른 키 이름으로 데이터를 저장
    tablesData.push({
        tableId: tableId,
        taskNumber: taskNumber,   // 과제번호 저장
        taskName: taskName,       // 과제명 저장
        startDate: startDate,
        endDate: endDate,
        taskResearcherId: taskResearcherId,
        taskResearcherName: taskResearcherName,
        taskPrincipalName : taskPrincipalName,
        taskAssignName : taskAssignName,
        totalAmount: 0            // 총 합계 초기화
    });

    updateTotalSum(); // 총합 및 계상률 업데이트
    
    // 테이블을 생성한 후에 합계 및 평균액을 업데이트
    updatePeriodSummary();
    
    document.getElementById('taskNumber').value = "";
    document.getElementById('taskName').value = "";
    document.getElementById('monthlyPayment').value = "";
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    document.getElementById('taskAssignName').value = "";
    
    document.getElementById('currentDateTime').textContent = "문서번호 : " + taskResearcherId + "_" + taskResearcherName + "_" +getCurrentDateTime() + " (서명(인))";
}

// 테이블 생성 함수
function generateTable(taskNumber, taskName, monthlyPayment, startDate, endDate, tableId, taskResearcherId, taskResearcherName, taskPrincipalName, taskAssignName) {
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('col-4', 'mb-4');
	   
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered','border-dark','border-1');
    table.id = tableId;

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th colspan="3" class="table-secondary">
                <button class="btn btn-danger btn-sm me-2 d-print-none" onclick="deleteTable('${tableId}')">삭제</button>
                ${taskNumber} - ${taskName}<br>
                연구책임자 : ${taskPrincipalName} (서명) /  과제담당자 : ${taskAssignName} (서명)
            </th>
        </tr>
        <tr class="table-secondary">
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
    let rowIndex = 0;
	
    while (start <= end) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 80px;">
              ${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}
              <input type="hidden" class="form-control taskNumber" name="${tableId}[${rowIndex}][taskNumber]" value="${taskNumber}">
              <input type="hidden" class="form-control taskName" name="${tableId}[${rowIndex}][taskName]" value="${taskName}">
              <input type="hidden" class="form-control taskResearcherId" name="${tableId}[${rowIndex}][taskResearcherId]" value="${taskResearcherId}">
              <input type="hidden" class="form-control taskResearcherName" name="${tableId}[${rowIndex}][taskResearcherName]" value="${taskResearcherName}">
              <input type="hidden" class="form-control taskPrincipalName" name="${tableId}[${rowIndex}][taskPrincipalName]" value="${taskPrincipalName}">
              <input type="hidden" class="form-control taskPrincipalName" name="${tableId}[${rowIndex}][taskAssignName]" value="${taskAssignName}">
            </td>
            <td><input type="number" class="form-control paymentInput" name="${tableId}[${rowIndex}][monthlyPayment]" value="${Math.round(monthlyPayment)}"></td>
            <td><input type="text" class="form-control ratioInput" name="${tableId}[${rowIndex}][period]" readonly></td>
        `;
        tbody.appendChild(row);

        totalAmount += Math.round(monthlyPayment);
        start.setMonth(start.getMonth() + 1); // 다음 달로 이동
	rowIndex++;
    }

    // 합계 행 추가
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td>합계</td>
        <td id="total-${tableId}">${totalAmount}</td>
        <td></td>
    `;
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    

    // 입력 필드에 이벤트 리스너 추가
    tableWrapper.addEventListener('input', function(event) {
        if (event.target.classList.contains('paymentInput')) {
            updateTableSum(tableId); // 테이블 합계 업데이트
            updateTotalSum(); // 총합 및 계상률 업데이트
        }
    });

    // 테이블 데이터를 저장
    tablesData.push({ tableId, taskNumber, taskName, totalAmount, startDate, endDate, taskResearcherId, taskResearcherName, taskPrincipalName, taskAssignName });   
    
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

    // 합계 업데이트
    const totalCell = table.querySelector(`#total-${tableId}`);
    totalCell.textContent = total;

    // 해당 테이블의 데이터를 업데이트
    const tableData = tablesData.find(t => t.tableId === tableId);
    tableData.totalAmount = total;

    updateTotalSum(); // 총합 및 계상률 업데이트
}

// 총합 및 계상률 업데이트 함수 (기간별 총합으로 변경)
function updateTotalSum() {
    const dateMap = {};

    // 기간별 총합을 계산
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

    // 각 테이블의 계상률을 기간별 총합을 기준으로 계산
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
            const periodTotal = (dateMap[yearMonth]/2) || 1; // 기간별 총합
            
            // 계상률 계산 (백분율로 소수점 2자리)
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

    // 삭제된 테이블의 데이터를 배열에서 제거
    tablesData = tablesData.filter(data => data.tableId !== tableId);

    updateTotalSum(); // 삭제 후 총합 및 계상률 업데이트
    
    // 테이블 삭제 후 합계 및 평균액 업데이트
    updatePeriodSummary();
}

// 검증 버튼을 눌렀을 때 팝업을 띄우고, 각 기간별 계상률 합을 보여줌
function validateRates() {
	document.getElementById("downloadExcelBtn").disabled = false;
	
    const dateMap = {};

    // 모든 기간의 계상률 합을 계산
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

    // 팝업 내용 생성
    let popupContent = '<h3>계상률 검증 결과</h3><table class="table table-striped text-center">';
    const sortedDates = Object.keys(dateMap).sort(); // 오름차순 정렬
    popupContent += "<tr><th>기간</th><th>계상률</th><th>체크</th></tr>";
    sortedDates.forEach(date => {
        const totalRatio = dateMap[date].toFixed(2) / 2;
        popupContent += `<tr><td>${date}</td><td>${totalRatio}%</td><td>${totalRatio != 100 ? '(오류)' : '(정상)'}</td></tr>`;
    });
    popupContent += '</table>';

    // 팝업 창 열기 및 Bootstrap 스타일 적용
    const popup = window.open('', '계상률 검증', 'width=400,height=650');
    popup.document.write(`
        <html>
            <head>
                <title>계상률 검증</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="container-fluid my-4">
                <div class="container">
                    ${popupContent}
                </div>
            </body>
        </html>
    `);
    popup.document.close();
}

// 보정 버튼 눌렀을 때 계상률 보정 함수
function correctRates() {
    const dateMap = {};

    // 모든 기간의 계상률 합을 계산
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

    // 첫 번째로 100%가 되지 않는 기간을 찾음
    const sortedDates = Object.keys(dateMap).sort(); // 오름차순 정렬
    let firstPeriod = null;
    sortedDates.forEach(date => {
        if (dateMap[date] !== 100 && firstPeriod === null) {
            firstPeriod = date; // 100%가 아닌 첫 번째 기간
        }
    });

    if (firstPeriod) {
        const totalRatio = dateMap[firstPeriod];

        // 첫 번째 기간이 포함된 테이블 찾기
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
                    targetInput = ratioInputs[i]; // 해당 테이블의 해당 기간의 계상률 input
                    break;
                }
                date.setMonth(date.getMonth() + 1);
                i++;
            }

            if (targetTable) {
                return;
            }
        });

        // 첫 번째 테이블의 해당 기간의 계상률 업데이트
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
    
    alert('검증에서 오류가 없을때 까지 눌러주세요.')
    validateRates();
}

// 총 기간별 합계 및 평균액을 계산하고 표시하는 함수
function updatePeriodSummary() {
    const dateMap = {};

    // 모든 테이블 데이터를 바탕으로 기간별 합계 계산
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

    // 기간별 합계 표시
    displayPeriodSummary(dateMap);

    // 총평균액 계산 후 표시
    displayTotalAverage(dateMap);
}

// 기간별 합계 및 총평균액을 테이블에 표시하는 함수
function displayPeriodSummary(dateMap) {
    const periodHeadersRow = document.getElementById('periodHeadersRow');
    const periodSumsRow = document.getElementById('periodSumsRow');

    // 초기화
    periodHeadersRow.innerHTML = '';
    periodSumsRow.innerHTML = '';

    let columnCount = 0;

    // 기간별 합계액 표시
    const sortedDates = Object.keys(dateMap).sort();
    sortedDates.forEach((date, index) => {
        periodHeadersRow.insertAdjacentHTML('beforeend', `<th style="background-color: #f0f0f0; text-align: center;">${date}</th>`);
        periodSumsRow.insertAdjacentHTML('beforeend', `<td style="text-align: center;">${(dateMap[date]/2).toLocaleString('ko-KR')}</td>`);

        columnCount++;
    });
    
    periodHeadersRow.insertAdjacentHTML('beforeend', `<th style="background-color: #f0f0f0; text-align: center;">총평균액</th>`);
    periodSumsRow.insertAdjacentHTML('beforeend', `<td style="text-align: center;">${(displayTotalAverage(dateMap)/2).toLocaleString('ko-KR')}</td>`);
}

// 총평균액을 periodSummaryContainer 아래에 별도로 표시하는 함수
function displayTotalAverage(dateMap) {
    const totalAverageContainer = document.getElementById('totalAverageContainer');
    totalAverageContainer.innerHTML = ''; // 기존 내용 초기화

    let totalSum = 0;
    let periodCount = 0;

    Object.values(dateMap).forEach(sum => {
        totalSum += sum;
        periodCount++;
    });

    const totalAverage = totalSum / periodCount;

    // 총평균액 표시
    const averageElement = document.createElement('p');
    //averageElement.textContent = `총평균액: ${totalAverage}`;
    //totalAverageContainer.appendChild(averageElement);
    return totalAverage;
}

function getCurrentDateTime() {  
  // 현재 날짜 시간 구하기
  const now = new Date();  
  // 년
  const year = now.getFullYear();
  // 월
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  // 일
  const day = now.getDate().toString().padStart(2, '0');
  // 시
  const hours = now.getHours().toString().padStart(2, '0');
  // 분
  const minutes = now.getMinutes().toString().padStart(2, '0');
  // 초
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return year + month + day + hours + minutes + seconds;
}

function printWindow() {
    window.print();
}

function showMonthlyTaskPopup() {
    
    const allData = tablesData.map(data => {
        const table = document.getElementById(data.tableId);
        const monthlyPayments = table.querySelectorAll('.paymentInput');
        const ratios = table.querySelectorAll('.ratioInput');

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        
        const taskAssignName = data.taskAssignName; // 과제담당자성명

        let date = new Date(start);
        let i = 0;
        const taskData = [];

        while (date <= end) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            console.log(data.taskNumber + "(" + data.taskAssignName + ")");
            taskData.push({
                yearMonth: yearMonth,
                taskNumber: data.taskNumber + "(" + data.taskAssignName + ")",
                ratio: ratios[i].value
            });
            date.setMonth(date.getMonth() + 1);
            i++;
        }

        return taskData;
    }).flat();

    const uniqueDates = [...new Set(allData.map(d => d.yearMonth))];
    const uniqueTasks = [...new Set(allData.map(d => d.taskNumber))];

    // 팝업에 피봇 테이블을 표시
    let popupContent = '<html><head><title>월별/과제별 계상률</title>';
    popupContent += '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet"></head>';
    popupContent += '<body class="container-fluid my-4"><div class="container">';
    popupContent += '<h3>월별/과제별 계상률</h3>';
    popupContent += '<table class="table table-bordered table-hover text-center"><thead><tr><th>기간</th>';

	let task_i = 0;
    uniqueTasks.forEach(task => {
        popupContent += `<th>${task}</th>`;
        task_i++;
    });
    
    //console.log("task_i" + task_i);
    
    popupContent += '</tr></thead><tbody>';

    uniqueDates.forEach(date => {
        popupContent += `<tr><td>${date}</td>`;
        uniqueTasks.forEach(task => {
            const data = allData.find(d => d.yearMonth === date && d.taskNumber === task);
            const ratioValue = data ? data.ratio : '-';
            popupContent += `<td>${ratioValue}</td>`;
        });
        popupContent += '</tr>';
    });

    popupContent += '</tbody></table></div></body></html>';
    
    const popup = window.open('', '월별/과제별', 'width=800,height=${task_i}*200');

    popup.document.write(popupContent);
    popup.document.close();
}

function generateExcel() {
    // 엑셀 워크북과 시트 생성
    const workbook = new ExcelJS.Workbook();
    //const worksheetSum = workbook.addWorksheet('월별 합계 데이터');
    const worksheetTask = workbook.addWorksheet('과제 데이터');

    // 테이블 헤더 설정
    worksheetTask.columns = [
        { header: '과제번호', key: 'taskNumber', width: 15 },
        { header: '과제명', key: 'taskName', width: 25 },
        { header: '시작년월', key: 'startDate', width: 15 },
        { header: '종료년월', key: 'endDate', width: 15 },
        { header: '월지급액', key: 'monthlyPayment', width: 15 },
        { header: '계상률', key: 'ratio', width: 15 },
        { header: '연구원직번', key: 'taskResearcherId', width: 15 },
        { header: '연구원성명', key: 'taskResearcherName', width: 15 },
        { header: '연구책임자성명', key: 'taskPrincipalName', width: 15 },
        { header: '과제담당자', key: 'taskAssignName', width: 15 }
    ];

    // 각 테이블 데이터를 엑셀에 추가
    tablesData.forEach(data => {
        const table = document.getElementById(data.tableId);
        const taskNumber = data.taskNumber; // 과제번호
        const taskName = data.taskName; // 과제명
        const startDate = data.startDate;
        const endDate = data.endDate;
        const monthlyPayments = table.querySelectorAll('.paymentInput');
        const ratios = table.querySelectorAll('.ratioInput');
        const taskResearcherId = data.taskResearcherId; // 연구원직번
        const taskResearcherName = data.taskResearcherName; // 연구원성명
        const taskPrincipalName = data.taskPrincipalName; // 연구책임자성명
        const taskAssignName = data.taskAssignName; // 과제담당자성명

        // 시작년월부터 종료년월까지 각 행을 생성
        let date = new Date(startDate);
        let i = 0;
        while (date <= new Date(endDate)) {
            worksheetTask.addRow({
                taskNumber: taskNumber,
                taskName: taskName,
                startDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                endDate: endDate,
                monthlyPayment: Number(monthlyPayments[i].value.replace(/,/g, '')), // 쉼표 제거
                ratio: ratios[i].value,
                taskResearcherId: taskResearcherId,
                taskResearcherName: taskResearcherName,
                taskPrincipalName: taskPrincipalName,
                taskAssignName: taskAssignName
            });

            date.setMonth(date.getMonth() + 1);
            i++;
        }
    });

    // 엑셀 파일 다운로드 처리
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '과제데이터_'+ document.getElementById('currentDateTime').textContent.replace('문서번호 _ ', '') +'.xlsx';   
        
        
        document.getElementById('currentDateTime').value
        document.getElementById('taskNumber').value;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
