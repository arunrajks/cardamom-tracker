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
        return NextResponse.json(result.data);
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}
