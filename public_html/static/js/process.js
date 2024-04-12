// script.js

function showLoading() {
  var loadingElement = document.getElementById('loading');
  loadingElement.style.display = 'block';
}

function hideLoading() {
  var loadingElement = document.getElementById('loading');
  loadingElement.style.display = 'none';
}

function updateButtonState() {
  var fileInput = document.getElementById('fileInput');
  var processButton = document.getElementById('processButton');

  if (fileInput.files.length > 0) {
      processButton.disabled = false;
  } else {
      processButton.disabled = true;
  }
}

function processFile() {
  var fileForm = document.getElementById('fileForm');
  var formData = new FormData(fileForm);
  fileForm.style.display = 'none';
  showLoading(); // Show loading indicator

  fetch('/process', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      console.log("data", data.csv_data);
      var resultContainer = document.getElementById('resultContainer');
      var pdfResult = document.getElementById('pdfResult');
      var pdfResultLabel = document.getElementById('pdfResultLabel');
      var pdfResultScore = document.getElementById('pdfResultScore');
      var zipResult = document.getElementById('zipResult');
      var downloadButton = document.getElementById('downloadButton');

      resultContainer.style.display = 'block';

      // Show download button only for ZIP files
      if (data.file_type === 'zip') {
          displayZipResults(data.csv_data);
          pdfResult.style.display = 'none';
          zipResult.style.display = 'block';
      } else {
        pdfResultLabel.textContent = data.csv_data['label'];
        pdfResultScore.textContent = data.csv_data['score'];
          zipResult.style.display = 'none';
          pdfResult.style.display = 'block';
      }
  })
  .catch(error => {
      hideLoading();
      console.error('Error:', error);
  })
  .finally(() => {
      hideLoading(); // Move hideLoading to finally block
  });
}

function displayZipResults(zipResults) {
  var zipResultTable = document.getElementById('zipResultTable');
  zipResultTable.innerHTML = ''; // Clear previous content

  // Split CSV data into rows
  var rows = zipResults.trim().split('\n');
  
  // Create table header
  var headerRow = zipResultTable.insertRow(0);
  var headers = rows[0].split(',');
  for (var i = 0; i < headers.length; i++) {
      var headerCell = headerRow.insertCell(i);
      headerCell.innerHTML = '<b>' + headers[i] + '</b>';
  }

  // Create table rows
  for (var i = 1; i < rows.length; i++) {
      var row = zipResultTable.insertRow(i);
      var cells = rows[i].split(',');
      for (var j = 0; j < cells.length; j++) {
          var cell = row.insertCell(j);
          cell.innerHTML = cells[j];
      }
  }
}

function downloadCSV() {
  var zipResultTable = document.getElementById('zipResultTable');
  
  // Get all rows from the table
  var rows = Array.from(zipResultTable.getElementsByTagName('tr'));

  // Extract data from each row
  var csvData = rows.map(row => {
      // Get all cells in the row
      var cells = Array.from(row.getElementsByTagName('td'));

      // Extract text content from each cell
      var rowData = cells.map(cell => cell.textContent.trim());

      // Join cell data with a comma to form a CSV row
      return rowData.join(',');
  });

  // Join rows with line breaks to form the final CSV data
  var finalCSVData = csvData.join('\n');

  // Create a Blob containing the CSV data
  var blob = new Blob([finalCSVData], { type: 'text/csv' });

  // Create a link element to trigger the download
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'result.csv';
  link.click();
}

