import React, { useMemo, useState } from 'react';
import { CardamomPrice } from '@/lib/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Building2 } from 'lucide-react';

interface MarketComparisonProps {
    data: CardamomPrice[];
}

export const MarketComparison: React.FC<MarketComparisonProps> = ({ data }) => {
    const [sortBy, setSortBy] = useState<'price' | 'volume'>('price');

    const marketStats = useMemo(() => {
        const stats = new Map<string, { total: number; count: number; volume: number }>();

        data.forEach(item => {
            const m = item.market || 'Unknown';
            const price = typeof item.price === 'string' ? parseFloat((item.price as string).replace(/,/g, '')) : item.price;
            const qty = typeof item.totalQty === 'string' ? parseFloat((item.totalQty as string).replace(/,/g, '')) : (item.totalQty || 0);

            if (!isNaN(price)) {
                const current = stats.get(m) || { total: 0, count: 0, volume: 0 };
                stats.set(m, {
                    total: current.total + price,
                    count: current.count + 1,
                    volume: current.volume + qty
                });
            }
        });

        const arr = Array.from(stats.entries()).map(([name, stat]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            fullName: name,
            avgPrice: stat.total / stat.count,
            volume: stat.volume,
            count: stat.count
        }));

        // Filter out small markets (< 10 auctions)
        const relevant = arr.filter(x => x.count > 10);

        return relevant.sort((a, b) => {
            if (sortBy === 'price') return b.avgPrice - a.avgPrice;
            return b.volume - a.volume;
        }).slice(0, 10); // Top 10
    }, [data, sortBy]);

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Top Markets</h3>
                </div>
                <div className="flex bg-gray-800 rounded-lg p-1 text-xs">
                    <button
                        onClick={() => setSortBy('price')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'price' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        By Price
                    </button>
                    <button
                        onClick={() => setSortBy('volume')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'volume' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        By Volume
                    </button>
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={marketStats}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val) => sortBy === 'price' ? `₹${val}` : val}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#9ca3af"
                            tick={{ fontSize: 11, fill: '#d1d5db' }}
                            width={150}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val: number) => sortBy === 'price' ? `₹${val.toFixed(2)}` : `${val.toFixed(0)} Kg`}
                        />
                        <Bar dataKey={sortBy === 'price' ? 'avgPrice' : 'volume'} fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {marketStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#1e3a8a'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
