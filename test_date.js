const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'spices_board_cardamom_price.csv.processed');
// We need to read it as buffer like the code does
const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: 'buffer' });
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet); // Raw JSON

console.log("First row raw:", JSON.stringify(data[0]));

const row = data[0];
// Check field name. Is it 'auction_date' or something else?
const dateStr = row['auction_date'];
console.log("dateStr:", dateStr, typeof dateStr);

if (dateStr) {
    const d = new Date(dateStr);
    console.log("Date object:", d);
    console.log("Timestamp:", d.getTime());

    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    console.log("Formatted:", formatted);
}
