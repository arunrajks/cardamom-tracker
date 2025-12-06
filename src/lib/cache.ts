import fs from 'fs';
import path from 'path';
import { CardamomPrice } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'history.json');

export function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export function getCache(): CardamomPrice[] {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }

    try {
        const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        if (!fileContent) return [];
        return JSON.parse(fileContent) as CardamomPrice[];
    } catch (error) {
        console.error("Error reading cache file:", error);
        // Return empty array if file is corrupted or unreadable to prevent crashing
        // But log error so we know.
        return [];
    }
}

export function updateCache(newPrices: CardamomPrice[]) {
    ensureDataDir();

    const existing = getCache();
    // Create a map by date+market to avoid duplicates
    // Using a composite key
    const uniqueMap = new Map<string, CardamomPrice>();

    // Load existing data first
    existing.forEach(item => {
        const key = `${item.date}-${item.market}-${item.price}`;
        uniqueMap.set(key, item);
    });

    // Merge new prices (overwriting if exact match, though usually newPrices are the source of truth)
    newPrices.forEach(item => {
        const key = `${item.date}-${item.market}-${item.price}`;
        uniqueMap.set(key, item);
    });

    const merged = Array.from(uniqueMap.values());

    // Sort by date descending
    merged.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first
    });

    console.log(`[Cache] Merged ${merged.length} records (Existing: ${existing.length}, New: ${newPrices.length})`);

    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(merged, null, 2));
        console.log("Successfully wrote cache to:", FILE_PATH);
    } catch (e) {
        console.error("Error writing cache file in updateCache:", e);
        throw new Error(`cannot save file ${FILE_PATH}: ${e}`);
    }
}
