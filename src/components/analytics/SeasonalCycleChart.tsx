import React, { useMemo } from 'react';
import { CardamomPrice } from '@/lib/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { CalendarClock } from 'lucide-react';

interface SeasonalCycleChartProps {
    data: CardamomPrice[];
    className?: string;
}

export const SeasonalCycleChart: React.FC<SeasonalCycleChartProps> = ({ data, className }) => {

    // Process for 10-Year Seasonal Cycle
    const seasonalData = useMemo(() => {
        const monthlyStats = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));

        data.forEach(item => {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                const month = date.getMonth();
                const price = typeof item.price === 'string'
                    ? parseFloat((item.price as string).replace(/,/g, ''))
                    : item.price;

                if (!isNaN(price) && price > 0) {
                    monthlyStats[month].total += price;
                    monthlyStats[month].count += 1;
                }
            }
        });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthlyStats.map((stats, idx) => ({
            month: months[idx],
            avgPrice: stats.count > 0 ? stats.total / stats.count : 0
        }));

    }, [data]);

    return (
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}>
            <div className="flex items-center space-x-2 mb-6">
                <CalendarClock className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Seasonal Cycles (10-Year Avg)</h3>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                        <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickFormatter={(val) => `₹${val}`} domain={['auto', 'auto']} />
                        <Tooltip
                            cursor={{ fill: '#374151', opacity: 0.2 }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            formatter={(val: number) => [`₹${val.toFixed(0)}`, '10-Year Avg']}
                        />
                        <Bar dataKey="avgPrice" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Identifies recurrent price peaks (e.g. Festival Season, Post-Harvest).</p>
        </div>
    );
};
