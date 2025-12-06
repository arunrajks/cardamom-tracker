import { NextResponse } from 'next/server';
import { getHistoricalPrices } from '@/lib/scraper';
import { getCache } from '@/lib/cache';

export async function GET() {
    // First try to get from cache
    const cachedData = getCache();
    if (cachedData.length > 0) {
        const response = NextResponse.json(cachedData);
        // Add CORS headers for Android app
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
    }

    // Fallback to live scrape if cache empty
    const result = await getHistoricalPrices();
    if (result.success) {
        const response = NextResponse.json(result.data);
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
    } else {
        const response = NextResponse.json({ error: result.error }, { status: 500 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    }
}
