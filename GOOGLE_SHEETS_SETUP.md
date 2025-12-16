# Google Sheets Contact Form Setup

To store your contact form submissions directly in a Google Sheet, follow these steps:

## 1. Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new **Blank** spreadsheet.
2. Rename the sheet tab (at the bottom) to `Sheet1` (it should be this by default).
3. In the first row, add the headers:
   - **A1**: `Date`
   - **B1**: `Name`
   - **C1**: `Email`
   - **D1**: `Phone`
   - **E1**: `Message`

## 2. Open Apps Script
1. In the Google Sheet, go to **Extensions** > **Apps Script**.
2. A new tab will open with a code editor.

## 3. Add the Script
Delete any code currently in the `Code.gs` file and paste the following code:

```javascript
const SHEET_NAME = "Sheet1";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function(header) {
      if (header === 'Date') return new Date();
      return e.parameter[header.toLowerCase()] || ''; 
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}
```

## 4. Deploy the Web App
1. Click the blue **Deploy** button at the top right > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill in the details:
   - **Description**: Contact Form Backend
   - **Execute as**: Me (your email)
   - **Who has access**: **Anyone** (This is crucial, otherwise the form won't work).
4. Click **Deploy**.
5. You might be asked to authorize the script. Click **Review permissions**, choose your account, click **Advanced** > **Go to ... (unsafe)** (it is safe, it's your own code), and click **Allow**.

## 5. Get the Web App URL
1. Copy the **Web App URL** provided after deployment (it starts with `https://script.google.com/macros/s/...`).
2. Open your project's `script.js` file.
3. Find the line:
   ```javascript
   const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
4. Replace `'YOUR_GOOGLE_SCRIPT_URL_HERE'` with the URL you just copied.

Done! Your form should now submit data to your Google Sheet.
