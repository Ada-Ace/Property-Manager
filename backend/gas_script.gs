/**
 * PropManage Pro - Backend API with Google Drive Upload (v2)
 * 
 * Instructions:
 * 1. Create a Google Sheet with the following tabs:
 *    - Units (Headers: id, unitNumber, size, expectedRent, status, fittings, propertyName)
 *    - Tenants (Headers: id, name, unit, mobile, password, baseRent, deposit, leaseStart, leaseEnd, leaseDocument, propertyName)
 *    - Bills (Headers: id, type, date, amount, mode, allocations, fileName, fileUrl, propertyName)
 *    - Tasks (Headers: id, title, tenantId, status, dateOptions, propertyName)
 *    - Messages (Headers: id, tenantId, content, timestamp, photoUrl, propertyName)
 *    - Properties (Headers: id, name, address, currency)
 * 2. In Google Drive, create a folder for uploads and COPY THE FOLDER ID.
 * 3. In Google Sheets: Extensions > Apps Script.
 * 4. Paste this code and ADD YOUR FOLDER ID to the constant below.
 * 5. Deploy as Web App (Me / Anyone).
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const UPLOAD_FOLDER_ID = 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID'; // <-- CRITICAL: Add your folder ID

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = {};
  
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    
    if (headers && headers.length > 0) {
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
    } else {
      data[sheetName.toLowerCase()] = [];
    }
  });

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const body = JSON.parse(e.postData.contents);
  const { action, sheetName, data, fileName, fileData } = body;

  // Handle File Upload to Google Drive (Action: UPLOAD)
  if (action === "UPLOAD") {
    try {
      if (!UPLOAD_FOLDER_ID || UPLOAD_FOLDER_ID === 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID') {
        return errorResponse("Missing UPLOAD_FOLDER_ID. Please update the GAS script.");
      }
      
      const folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
      const contentType = fileData.substring(5, fileData.indexOf(';'));
      const bytes = Utilities.base64Decode(fileData.split(',')[1]);
      const blob = Utilities.newBlob(bytes, contentType, fileName);
      const file = folder.createFile(blob);
      
      // Set permissions: Anyone with link can view
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        url: file.getDownloadUrl().replace("?e=download", ""), // Clean download/preview link
        fileId: file.getId() 
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return errorResponse("Upload Failed: " + err.toString());
    }
  }

  // Handle Sheet Operations (Action: ADD or UPDATE)
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return errorResponse("Sheet not found: " + sheetName);

  if (action === "ADD") {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => {
      let val = data[header];
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      return val !== undefined ? val : "";
    });
    sheet.appendRow(newRow);
    return successResponse("Data added successfully");
  }
  
  if (action === "UPDATE") {
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const idIndex = headers.indexOf("id");
    const nameIndex = headers.indexOf("name"); // Fallback for Settings persistence
    
    for (let i = 0; i < rows.length; i++) {
      // Logic for properties fallback (as we often key by name instead of generated ID)
      const isPropertyMatch = (sheetName === "Properties" && data.name && String(rows[i][nameIndex]) === String(data.name));
      const isIdMatch = (data.id && String(rows[i][idIndex]) === String(data.id));

      if (isIdMatch || isPropertyMatch) {
        const range = sheet.getRange(i + 2, 1, 1, headers.length);
        const updatedRow = headers.map(header => {
          let val = data[header];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          // Preserve existing value if not provided in update
          return val !== undefined ? val : rows[i][headers.indexOf(header)];
        });
        range.setValues([updatedRow]);
        return successResponse("Data updated successfully");
      }
    }
  }

  // Handle DELETE Action
  if (action === "DELETE") {
    // If it's the last row, getLastRow() - 1 will be 0. We need to handle that.
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return errorResponse("Sheet empty");
    
    const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    const idIndex = headers.indexOf("id");
    
    for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][idIndex]) === String(data.id)) {
            sheet.deleteRow(i + 2);
            return successResponse("Deleted successfully from " + sheetName);
        }
    }
    return errorResponse("Record not found to delete (" + data.id + ")");
  }

  return errorResponse("Invalid action provided");
}

function successResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
