const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'data', 'history.xlsx');

try {
    const workbook = XLSX.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet); // Array of objects

    console.log("Total Rows in XLSX:", json.length);
    if (json.length > 0) {
        console.log("First Row:", JSON.stringify(json[0]));
        console.log("Last Row:", JSON.stringify(json[json.length - 1]));
    }
} catch (e) {
    console.error("Error reading file:", e);
}
