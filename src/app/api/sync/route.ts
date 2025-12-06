import { NextRequest, NextResponse } from 'next/server';
import { getPricesForPage } from '@/lib/scraper';
import { updateCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fullSync = searchParams.get('full') === 'true';

    // If full sync, aim for all pages (approx 535). 
    // Otherwise just top 5 for quick update.
    const MAX_PAGES = fullSync ? 600 : 5;
    const BATCH_SIZE = 10; // Fetch 10 pages in parallel

    let totalRecords = 0;
    let page = 1;
    let keepFetching = true;

    try {
        console.log(`Starting sync... Full: ${fullSync}`);

        while (keepFetching && page <= MAX_PAGES) {
            const promises = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                const p = page + i;
                if (p > MAX_PAGES) break;
                promises.push(getPricesForPage(p));
            }

            console.log(`Fetching batch starting at page ${page}...`);
            const results = await Promise.all(promises);

            const batchData = [];
            let emptyPagesInBatch = 0;

            for (const res of results) {
                if (res.success && res.data.length > 0) {
                    batchData.push(...res.data);
                } else {
                    emptyPagesInBatch++;
                }
            }

            if (batchData.length > 0) {
                updateCache(batchData);
                totalRecords += batchData.length;
                console.log(`Synced ${batchData.length} records. Total so far: ${totalRecords}`);
            }

            // If entire batch was empty/failed, we probably reached the end
            if (emptyPagesInBatch === promises.length) {
                keepFetching = false;
                console.log("Reached end of data.");
            }

            page += BATCH_SIZE;

            // Small delay to be nice to the server
            await new Promise(r => setTimeout(r, 1000));
        }

        return NextResponse.json({ success: true, message: `Synced ${totalRecords} records to cache.` });
    } catch (e: any) {
        console.error("Sync error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
