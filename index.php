<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>과제 테이블 생성</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container-fluid my-4">
	<div class="row h-50">
	    <div class="col"><h5>&nbsp;■ 인건비지급계획서</h5></div>
	    <div class="col"></div>
	    <div class="col" style="text-align:center;">
	    	<div class="col alert alert-dark" role="alert" id='currentDateTime'></div>
	    </div>
	</div>
    <!-- Input Form -->
    <div class="mb-3 row d-print-none">
        <div class="col">
            <input type="text" id="taskNumber" class="form-control" placeholder="과제번호">
        </div>
        <div class="col">
            <input type="text" id="taskName" class="form-control" placeholder="과제명">
        </div>
        <div class="col">
            <input type="number" id="monthlyPayment" class="form-control" placeholder="월지급액">
        </div>
        <div class="col">
            <input type="month" id="startDate" class="form-control" placeholder="시작년월">
        </div>
        <div class="col">
            <input type="month" id="endDate" class="form-control" placeholder="종료년월">
        </div>
    </div>
    <div class="mb-3 row d-print-none">
        <div class="col">
            <input type="text" id="taskResearcherId" class="form-control" placeholder="연구원직번">
        </div>
        <div class="col">
            <input type="text" id="taskResearcherName" class="form-control" placeholder="연구원성명">
        </div>
        <div class="col d-print-none">
            <input type="text" id="taskPrincipalName" class="form-control" placeholder="연구책임자성명">
        </div>
        <div class="col d-print-none">
            <input type="text" id="taskAssignName" class="form-control" placeholder="과제담당자">
        </div>
    </div>

    <!-- 오른쪽 정렬 버튼 -->
    <div class="row h-50 d-print-none">
	    <div class="col">
	    	<div class="alert alert-warning" role="alert">
			  엑셀 다운로드는 검증 후 가능합니다.
			</div>
	    </div>
	    <div class="col">
	    	<div class="alert alert-success" role="alert">
			  출력물을 제출해 주시기 바랍니다.
			</div>
	    </div>
	    <div class="col text-end h-50">
		    <button id="createTableBtn" class="btn btn-primary">생성</button>
	        <button id="validateRatesBtn" class="btn btn-warning">검증</button>
	        <button id="correctRatesBtn" class="btn btn-success">보정</button>
			<button id="monthlyTaskBtn" class="btn btn-primary">월별/과제별</button>
	        <button id="downloadExcelBtn" class="btn btn-primary" disabled>엑셀</button>
	        <button id="printlBtn" class="btn btn-secondary">출력하기</button>
	    </div>
	</div>
    <div>&nbsp;</div>
    <!-- 모든 기간의 합계 및 총평균액 표시 테이블 -->
    <div id="periodSummaryContainer" class="mb-4">
        <table id="periodSummaryTable" class="table table-bordered border-dark border-1">
            <thead>
                <tr id="periodHeadersRow"></tr> <!-- 기간 헤더 -->
            </thead>
            <tbody>
                <tr id="periodSumsRow"></tr> <!-- 기간 합계 -->
            </tbody>
        </table>
    </div>

    <!-- 총평균액 표시 -->
    <div id="totalAverageContainer" class="mb-4"></div>

    <!-- Table Container -->
    <div id="tableContainer" class="row mt-3"></div>

    <script src="https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js"></script>
    <script src="app.js"></script>
</body>
</html>