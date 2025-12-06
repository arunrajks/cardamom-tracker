const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'data', 'spices_board_cardamom_price.csv');
console.log("Path:", file);
try {
    const data = fs.readFileSync(file, 'utf-8');
    console.log("Success. First 50 chars:", data.substring(0, 50));
} catch (e) {
    console.error("Fail:", e.message);
}
