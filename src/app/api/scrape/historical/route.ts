import { NextResponse } from 'next/server';
import { getHistoricalPrices } from '@/lib/scraper';
import { getCache } from '@/lib/cache';

export async function GET() {
    // First try to get from cache
    const cachedData = getCache();
    if (cachedData.length > 0) {
        return NextResponse.json(cachedData);
    }

    // Fallback to live scrape if cache empty
    const result = await getHistoricalPrices();
    if (result.success) {
        return NextResponse.json(result.data);
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}
