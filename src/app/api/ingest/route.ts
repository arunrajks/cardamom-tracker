import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';
import { updateCache } from '@/lib/cache';
import { CardamomPrice } from '@/lib/types';

export async function GET() {
    const csvPath = path.join(process.cwd(), 'data', 'spices_board_cardamom_price.csv');
    const xlsPath = path.join(process.cwd(), 'data', 'history.xls');

    let prices: CardamomPrice[] = [];
    let sourceFile = '';

    try {
        // Priority 1: CSV File
        if (fs.existsSync(csvPath)) {
            console.log("Ingesting from CSV:", csvPath);
            sourceFile = csvPath;
            const fileBuffer = fs.readFileSync(csvPath);
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // raw: false ensures cells are formatted as strings (e.g. dates become "2025-12-05")
            // instead of Excel serial numbers (45996).
            const data = XLSX.utils.sheet_to_json<any>(sheet, { raw: false });

            data.forEach(row => {
                // CSV Headers: auction_date,auctioneer,no_of_lots,qty_arived_kg,qty_sold_kg,max_price_per_kg,avg_price_per_kg
                const dateStr = row['auction_date'];
                const market = row['auctioneer'];
                const lots = row['no_of_lots'];
                const arrived = row['qty_arived_kg'];
                const sold = row['qty_sold_kg'];
                const maxPrice = parseFloat(row['max_price_per_kg']);
                const price = parseFloat(row['avg_price_per_kg']);

                if (dateStr && !isNaN(price)) {
                    // Convert YYYY-MM-DD to DD-MMM-YYYY
                    let formattedDate = dateStr;
                    try {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                            const day = d.getDate().toString().padStart(2, '0');
                            const month = d.toLocaleString('default', { month: 'short' });
                            const year = d.getFullYear();
                            formattedDate = `${day}-${month}-${year}`;
                        }
                    } catch (e) { }

                    prices.push({
                        date: formattedDate,
                        market: market || "Unknown Market",
                        grade: 'Small Cardamom',
                        price: price,
                        avgPrice: price,
                        maxPrice: isNaN(maxPrice) ? 0 : maxPrice,
                        totalQty: arrived?.toString() || "0",
                        soldQty: sold?.toString() || "0",
                        lotSize: lots?.toString() || "0"
                    });
                }
            });
        } else {
            return NextResponse.json({ error: 'No data file found (checked spices_board_cardamom_price.csv)' }, { status: 404 });
        }

        if (prices.length > 0) {
            updateCache(prices);
            // Rename processed file
            fs.renameSync(sourceFile, sourceFile + '.processed');
            return NextResponse.json({ success: true, count: prices.length, source: sourceFile, message: "Ingestion complete" });
        } else {
            return NextResponse.json({ error: "No valid rows found" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Ingestion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
