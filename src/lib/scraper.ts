import axios from 'axios';
import * as cheerio from 'cheerio';
import { CardamomPrice, ScrapeResult } from './types';

// URLs
// URLs
const DAILY_URL = 'https://indianspices.com/marketing/price/domestic/daily-price-small.html'; // Changed to Small Cardamom
const ARCHIVE_URL = 'https://indianspices.com/marketing/price/domestic/daily-price-small.html';

export async function getDailyPrices(): Promise<ScrapeResult> {
    // reusing the logic for specific page 1
    return getPricesForPage(1);
}

export async function getPricesForPage(page: number): Promise<ScrapeResult> {
    try {
        const url = page === 1 ? DAILY_URL : `${ARCHIVE_URL}?page=${page}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const prices: CardamomPrice[] = [];

        // Find the table that contains "Date of Auction"
        const table = $('table').filter((i, el) => {
            return $(el).text().includes('Date of Auction');
        }).last();

        table.find('tr').each((i, row) => {
            // Skip header row
            if (i === 0) return;

            const cols = $(row).find('td');

            if (cols.length >= 7) {
                const date = $(cols[1]).text().trim();
                const market = $(cols[2]).text().trim();

                const avgPriceStr = $(cols[7]).text().trim();
                const maxPriceStr = $(cols[6]).text().trim();
                const arrivedQtyStr = $(cols[4]).text().trim();
                const soldQtyStr = $(cols[5]).text().trim();
                const lotSizeStr = $(cols[3]).text().trim();

                const price = parseFloat(avgPriceStr.replace(/,/g, ''));
                const maxPrice = parseFloat(maxPriceStr.replace(/,/g, ''));

                if (date && !isNaN(price)) {
                    prices.push({
                        date,
                        market,
                        grade: 'Small Cardamom',
                        price,
                        avgPrice: price,
                        maxPrice: isNaN(maxPrice) ? 0 : maxPrice,
                        totalQty: arrivedQtyStr,
                        soldQty: soldQtyStr,
                        lotSize: lotSizeStr
                    });
                }
            }
        });

        return { success: true, data: prices };
    } catch (error: any) {
        console.error(`Error scraping page ${page}:`, error);
        return { success: false, data: [], error: error.message };
    }
}

export async function getHistoricalPrices(): Promise<ScrapeResult> {
    // This function is now mainly for the initial view or could be deprecated in favor of cache
    return getPricesForPage(1);
}
