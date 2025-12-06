export interface CardamomPrice {
    date: string;
    market: string;
    grade: string;
    price: number;
    lotSize?: string;
    totalQty?: string;
    soldQty?: string;
    maxPrice?: number;
    avgPrice?: number;
}

export interface ScrapeResult {
    success: boolean;
    data: CardamomPrice[];
    error?: string;
}
