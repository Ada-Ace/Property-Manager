/**
 * MDO - Command Your Day
 * 
 * Instructions:
 * 1. Create a Google Sheet with the following tabs (ALL CAPS):
 *    - UNITS (Headers: ID, UNITNUMBER, SIZE, EXPECTEDRENT, STATUS, FITTINGS, PROPERTYNAME)
 *    - TENANTS (Headers: ID, NAME, UNIT, MOBILE, PASSWORD, BASERENT, DEPOSIT, LEASESTART, LEASEEND, LEASEDOCUMENT, PROPERTYNAME)
 *    - BILLS (Headers: ID, TYPE, DATE, AMOUNT, MODE, ALLOCATIONS, FILENAME, FILEURL, PROPERTYNAME)
 *    - TASKS (Headers: ID, TITLE, TENANTID, STATUS, DATEOPTIONS, PROPERTYNAME)
 *    - MESSAGES (Headers: ID, TENANTID, CONTENT, TIMESTAMP, PHOTOURL, PROPERTYNAME)
 *    - PROPERTIES (Headers: ID, NAME, ADDRESS, CURRENCY)
 *    - MANAGERS (Headers: ID, NAME, MOBILE, PASSWORD)
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
    // Normalise sheet name to prevent mismatch (e.g. "Managers " vs "managers")
    const sheetName = sheet.getName().toLowerCase().trim();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    
    if (headers && headers.length > 0) {
      // Normalise headers to lowercase and trim
      const cleanHeaders = headers.map(h => String(h).toLowerCase().trim());
      
      data[sheetName] = rows.map(row => {
        const obj = {};
        cleanHeaders.forEach((header, index) => {
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
      data[sheetName] = [];
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
  // Handle File Upload to Google Drive (Action: UPLOAD)
  if (action === "UPLOAD") {
    try {
      let folder;
      if (!UPLOAD_FOLDER_ID || UPLOAD_FOLDER_ID === 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID') {
        folder = DriveApp.getRootFolder();
      } else {
        try {
          folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
        } catch (e) {
          folder = DriveApp.getRootFolder();
        }
      }
      
      const contentType = fileData.substring(5, fileData.indexOf(';'));
      const bytes = Utilities.base64Decode(fileData.split(',')[1]);
      const blob = Utilities.newBlob(bytes, contentType, fileName);
      const file = folder.createFile(blob);
      
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileId = file.getId();
      const directUrl = `https://drive.google.com/uc?id=${fileId}`;
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        url: directUrl, 
        fileId: fileId 
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return errorResponse("Upload Failed: " + err.toString());
    }
  }

  // Handle Sheet Operations
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return errorResponse("Sheet not found: " + sheetName);

  // Get headers and define utility for case-insensitive lookup
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const findIdx = (name) => headers.findIndex(h => String(h).toLowerCase() === name.toLowerCase());

  if (action === "ADD") {
    const newRow = headers.map(header => {
      const dataKey = Object.keys(data).find(k => k.toLowerCase() === String(header).toLowerCase());
      let val = dataKey ? data[dataKey] : "";
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      return val;
    });
    sheet.appendRow(newRow);
    return successResponse("Data added successfully");
  }
  
  if (action === "UPDATE") {
    const rows = sheet.getDataRange().getValues();
    const idIndex = findIdx("id");
    const nameIndex = findIdx("name");
    
    // Normalised input data for comparison
    const targetId = data.id ? String(data.id).trim().toLowerCase() : null;
    const targetName = data.name ? String(data.name).trim().toLowerCase() : null;

    for (let i = 1; i < rows.length; i++) { // Skip header row
        const rowId = idIndex !== -1 ? String(rows[i][idIndex]).trim().toLowerCase() : null;
        const rowName = nameIndex !== -1 ? String(rows[i][nameIndex]).trim().toLowerCase() : null;
        
        const isIdMatch = (targetId && rowId === targetId);
        const isPropertyMatch = (sheetName === "Properties" && targetName && rowName === targetName);

        if (isIdMatch || isPropertyMatch) {
            const updatedRow = headers.map((header, colIdx) => {
                const dataKey = Object.keys(data).find(k => k.toLowerCase() === String(header).toLowerCase());
                let val = dataKey ? data[dataKey] : undefined;
                
                if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                // Preserve existing value if not provided in update
                return val !== undefined ? val : rows[i][colIdx];
            });
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
            return successResponse("Data updated successfully");
        }
    }
    return errorResponse("Record not found to update (" + (targetId || targetName) + ")");
  }

  if (action === "DELETE") {
    const rows = sheet.getDataRange().getValues();
    const idIndex = findIdx("id");
    if (idIndex === -1) return errorResponse("No ID column found for deletion");

    const targetId = String(data.id).trim().toLowerCase();
    
    for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][idIndex]).trim().toLowerCase();
        if (rowId === targetId) {
            sheet.deleteRow(i + 1);
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
