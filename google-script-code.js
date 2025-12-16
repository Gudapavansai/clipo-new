// 1. COPY ALL OF THIS CODE
// 2. GO TO: Extensions > Apps Script (in your Google Sheet)
// 3. PASTE THIS REPLACING EVERYTHING THERE
// 4. CLICK: Deploy > New Deployment > Select "Web App" > Who has access: "Anyone" > Deploy
// 5. COPY the "Web App URL" (starts with script.google.com) and paste it into script.js

const SHEET_NAME = "Sheet1";

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = doc.getSheetByName(SHEET_NAME);

        // Auto-create sheet if missing
        if (!sheet) {
            sheet = doc.insertSheet(SHEET_NAME);
        }

        // Auto-add Headers if sheet is empty
        if (sheet.getLastRow() === 0) {
            const initialHeaders = ['Date', 'Name', 'Email', 'Phone', 'Message'];
            sheet.appendRow(initialHeaders);
        }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        const newRow = headers.map(function (header) {
            if (header === 'Date') return new Date();
            // Matches form input names: name, email, phone, message
            return e.parameter[header.toLowerCase()] || '';
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    finally {
        lock.releaseLock();
    }
}
