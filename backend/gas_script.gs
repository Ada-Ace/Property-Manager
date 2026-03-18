/**
 * PropManage Pro - Backend API (Google Apps Script)
 * 
 * Instructions:
 * 1. Create a Google Sheet with the following tabs:
 *    - Units (Headers: id, unitNumber, size, expectedRent, status, fittings)
 *    - Tenants (Headers: id, name, unit, email, mobile, password, baseRent, deposit, leaseStart, leaseEnd)
 *    - Bills (Headers: id, type, date, amount, mode, allocations)
 *    - Tasks (Headers: id, title, tenantId, status, dateOptions)
 *    - Messages (Headers: id, tenantId, content, timestamp)
 * 2. In Google Sheets: Extensions > Apps Script.
 * 3. Copy/Paste this code into the editor.
 * 4. Click 'Deploy' > 'New Deployment' > Type: Web App.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the 'Web App URL' and add it to your .env file as VITE_API_URL.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = {};
  
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    
    data[sheetName.toLowerCase()] = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let val = row[index];
        // Parse JSON strings if needed
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
          try { val = JSON.parse(val); } catch(err) {}
        }
        obj[header] = val;
      });
      return obj;
    });
  });

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const body = JSON.parse(e.postData.contents);
  const { action, sheetName, data } = body;
  
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return errorResponse("Sheet not found");

  if (action === "ADD") {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => {
      let val = data[header];
      if (typeof val === 'object') val = JSON.stringify(val);
      return val || "";
    });
    sheet.appendRow(newRow);
    return successResponse("Data added successfully");
  }
  
  if (action === "UPDATE") {
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const idIndex = headers.indexOf("id");
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === data.id) {
        const range = sheet.getRange(i + 2, 1, 1, headers.length);
        const updatedRow = headers.map(header => {
          let val = data[header];
          if (typeof val === 'object') val = JSON.stringify(val);
          return val !== undefined ? val : rows[i][headers.indexOf(header)];
        });
        range.setValues([updatedRow]);
        return successResponse("Data updated successfully");
      }
    }
  }

  return errorResponse("Invalid action");
}

function successResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, message }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle CORS (if needed, but GAS handles this with redirects for Web Apps)
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
