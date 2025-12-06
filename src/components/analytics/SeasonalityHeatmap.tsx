import React, { useMemo } from 'react';
import { CardamomPrice } from '@/lib/types';
import { Calendar } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface SeasonalityHeatmapProps {
    data: CardamomPrice[];
}

export const SeasonalityHeatmap: React.FC<SeasonalityHeatmapProps> = ({ data }) => {

    // Process data to find avg price per Month-Year AND Seasonal Trend
    const processedData = useMemo(() => {
        const map = new Map<string, { total: number; count: number }>();
        const years = new Set<number>();

        // For monthly aggregates
        const monthlyStats = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));

        data.forEach(item => {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-11
                const key = `${year}-${month}`;

                years.add(year);

                const current = map.get(key) || { total: 0, count: 0 };
                // Ensure price is number
                const price = typeof item.price === 'string'
                    ? parseFloat((item.price as string).replace(/,/g, ''))
                    : item.price;

                if (!isNaN(price) && price > 0) {
                    map.set(key, { total: current.total + price, count: current.count + 1 });

                    monthlyStats[month].total += price;
                    monthlyStats[month].count += 1;
                }
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => b - a); // Descending

        // Find min/max for color scaling
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        const grid = sortedYears.map(year => {
            const months = Array.from({ length: 12 }, (_, monthIdx) => {
                const stats = map.get(`${year}-${monthIdx}`);
                const avg = stats ? stats.total / stats.count : 0;
                if (avg > 0) {
                    minPrice = Math.min(minPrice, avg);
                    maxPrice = Math.max(maxPrice, avg);
                }
                return { avg, count: stats?.count || 0 };
            });
            return { year, months };
        });

        const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const seasonalTrend = monthlyStats.map((stats, idx) => ({
            month: monthsLabels[idx],
            avgPrice: stats.count > 0 ? stats.total / stats.count : 0
        }));

        return { grid, minPrice, maxPrice, seasonalTrend };
    }, [data]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getColor = (price: number) => {
        if (price === 0) return { backgroundColor: 'rgba(31, 41, 55, 0.5)' }; // bg-gray-800/50 equivalent

        const { minPrice, maxPrice } = processedData;
        const ratio = (price - minPrice) / (maxPrice - minPrice);
        const hue = Math.floor(ratio * 120); // 0 (Red) to 120 (Green)
        return { backgroundColor: `hsla(${hue}, 70%, 40%, 0.8)` };
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl space-y-8">
            <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Seasonality Analysis</h3>
            </div>

            {/* 1. Seasonal Trend Chart */}
            <div className="h-[250px] w-full">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Historical Average Price by Month</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData.seasonalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSeason" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                        <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            formatter={(val: number) => [`₹${val.toFixed(0)}`, 'Avg Price']}
                        />
                        <Area type="monotone" dataKey="avgPrice" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSeason)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="w-full border-t border-white/10 my-6"></div>

            {/* 2. Heatmap Grid */}
            <div className="overflow-x-auto">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Detailed History (Year x Month)</h4>
                <div className="min-w-[700px]">
                    {/* Header */}
                    <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-2">
                        <div className="text-gray-500 text-xs font-medium">Year</div>
                        {months.map(m => (
                            <div key={m} className="text-center text-gray-400 text-xs uppercase font-medium">{m}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="space-y-1">
                        {processedData.grid.map(({ year, months }) => (
                            <div key={year} className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 h-8 items-center">
                                <div className="text-gray-400 text-sm font-mono">{year}</div>
                                {months.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className="h-full rounded transition-all hover:scale-110 hover:ring-2 hover:ring-white/50 relative group cursor-default shadow-sm"
                                        style={getColor(m.avg)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-white drop-shadow-md">₹{m.avg.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex justify-between items-center bg-gray-800/30 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-gray-400">
                            Price Range: <span className="text-white font-mono">₹{processedData.minPrice.toFixed(0)} - ₹{processedData.maxPrice.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <span className="w-4 h-4 rounded bg-[hsl(0,70%,40%)]"></span>
                                <span>Low</span>
                            </div>
                            <div className="h-1 w-24 bg-gradient-to-r from-[hsl(0,70%,40%)] via-[hsl(60,70%,40%)] to-[hsl(120,70%,40%)] rounded-full"></div>
                            <div className="flex items-center space-x-1">
                                <span className="w-4 h-4 rounded bg-[hsl(120,70%,40%)]"></span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
