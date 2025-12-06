import { NextResponse } from 'next/server';
import { getDailyPrices } from '@/lib/scraper';
import { updateCache } from '@/lib/cache';

export async function GET() {
    const result = await getDailyPrices();
    if (result.success) {
        // Update cache with latest daily data
        try {
            updateCache(result.data);
        } catch (cacheError) {
            console.error("Failed to update cache:", cacheError);
            // Continue to return data even if cache update fails
        }
        const response = NextResponse.json(result.data);
        // Add CORS headers for Android app
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
