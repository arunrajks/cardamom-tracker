const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'data', 'history.xls');

try {
    const workbook = XLSX.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

    console.log("Headers:", json[0]);
    console.log("First Row:", json[1]);
} catch (e) {
    console.error("Error reading file:", e);
}
