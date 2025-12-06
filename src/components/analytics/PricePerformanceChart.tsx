import React, { useMemo } from 'react';
import { CardamomPrice } from '@/lib/types';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PricePerformanceChartProps {
    data: CardamomPrice[];
}

export const PricePerformanceChart: React.FC<PricePerformanceChartProps> = ({ data }) => {

    // Calculate SMA and Bollinger Bands
    const processedData = useMemo(() => {
        // Ensure data is sorted by date ascending for calculation
        // The incoming data might be descending (latest first).
        // Let's create a reversed copy for calculation, then reverse back or just use valid range.

        let sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Filter out invalid prices
        const mapped = sorted.map(item => {
            const val = typeof item.price === 'string' ? parseFloat((item.price as string).replace(/,/g, '')) : item.price;
            return { ...item, _price: val };
        }).filter(x => !isNaN(x._price) && x._price > 0);

        const period = 14;
        const result = [];

        for (let i = 0; i < mapped.length; i++) {
            const item = mapped[i];

            if (i < period - 1) {
                // Not enough data for SMA
                result.push({
                    ...item,
                    dateShort: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    sma: null,
                    upper: null,
                    lower: null,
                    band: null
                });
                continue;
            }

            // Calculate Slice
            const slice = mapped.slice(i - period + 1, i + 1);
            const sum = slice.reduce((acc, curr) => acc + curr._price, 0);
            const sma = sum / period;

            // StdDev
            const squaredDiffs = slice.map(x => Math.pow(x._price - sma, 2));
            const variance = squaredDiffs.reduce((acc, curr) => acc + curr, 0) / period;
            const stdDev = Math.sqrt(variance);

            const upper = sma + (2 * stdDev);
            const lower = sma - (2 * stdDev);

            result.push({
                ...item,
                dateShort: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                price: item._price,
                sma: sma,
                upper: upper,
                lower: lower,
                // Recharts area range: [lower, upper]
                band: [lower, upper]
            });
        }

        // Return only the last N points (e.g. 100) to keep chart readable? 
        // Or all points? The user asked for "Moving Average Plot". 
        // If we show 10 years, 14 days is very fine. 
        // Let's return all but handle density via downsampling if needed.
        // For visual stability, let's return the last 90 auctions (approx 3 months).
        // User didn't specify range, but usually performance metrics are for recent analysis.
        // Let's return last 60 auctions.
        return result.slice(-60);

    }, [data]);

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h3 className="text-xl font-bold text-white">Price Performance</h3>
                        <p className="text-xs text-gray-400">14-Day SMA & Volatility Bands (2σ)</p>
                    </div>
                </div>
                {/* Legend/Indicator explanation could go here */}
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                        <XAxis
                            dataKey="dateShort"
                            stroke="#9ca3af"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `₹${val}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                            formatter={(value: any, name: string) => {
                                if (Array.isArray(value)) return [`₹${value[0].toFixed(0)} - ₹${value[1].toFixed(0)}`, 'Vol. Band'];
                                if (typeof value === 'number') return [`₹${value.toFixed(2)}`, name === 'price' ? 'Price' : 'SMA (14)'];
                                return value;
                            }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        {/* Volatility Band (Area Range) */}
                        <Area
                            type="monotone"
                            dataKey="band"
                            stroke="none"
                            fill="url(#bandGradient)"
                            name="Volatility Band"
                        />

                        {/* SMA Line */}
                        <Line
                            type="monotone"
                            dataKey="sma"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="14-Day Trend"
                        />

                        {/* Actual Price */}
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            strokeWidth={1.5}
                            dot={{ r: 2, fill: '#10b981' }}
                            activeDot={{ r: 6 }}
                            strokeOpacity={0.6}
                            name="Actual Price"
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 bg-gray-800/20 p-3 rounded-lg">
                <div>
                    <span className="block text-gray-500 font-semibold mb-1">MOVING AVERAGE (SMA)</span>
                    Filters out daily market noise to show the true direction of the price trend.
                </div>
                <div>
                    <span className="block text-gray-500 font-semibold mb-1">VOLATILITY BANDS</span>
                    Wide bands = Unstable Market (High Risk). Narrow bands = Stable Market (Consolidation).
                </div>
            </div>
        </div>
    );
};
