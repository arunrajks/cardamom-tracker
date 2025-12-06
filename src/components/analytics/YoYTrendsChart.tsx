import React, { useMemo } from 'react';
import { CardamomPrice } from '@/lib/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { CalendarClock } from 'lucide-react';

interface YoYTrendsChartProps {
    data: CardamomPrice[];
    className?: string;
}

export const YoYTrendsChart: React.FC<YoYTrendsChartProps> = ({ data, className }) => {

    // Process for Year-Over-Year (Last 3 Years)
    const yoyData = useMemo(() => {
        const activeYears = new Set<number>();
        const monthlyData: Record<string, any> = {};

        // Initialize months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        months.forEach(m => monthlyData[m] = { name: m });

        // Find latest year
        const latestYear = data.length > 0 ? new Date(data[0].date).getFullYear() : new Date().getFullYear();
        const targetYears = [latestYear, latestYear - 1, latestYear - 2];

        // Aggregate
        const yearMonthMap = new Map<string, { total: number; count: number }>();

        data.forEach(item => {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                if (targetYears.includes(year)) {
                    activeYears.add(year);
                    const monthIdx = date.getMonth();
                    const key = `${year}-${monthIdx}`;

                    const price = typeof item.price === 'string'
                        ? parseFloat((item.price as string).replace(/,/g, ''))
                        : item.price;

                    if (!isNaN(price) && price > 0) {
                        const current = yearMonthMap.get(key) || { total: 0, count: 0 };
                        yearMonthMap.set(key, { total: current.total + price, count: current.count + 1 });
                    }
                }
            }
        });

        // Fill chart data
        targetYears.forEach(year => {
            months.forEach((m, idx) => {
                const key = `${year}-${idx}`;
                const stats = yearMonthMap.get(key);
                if (stats && stats.count > 0) {
                    monthlyData[m][year] = stats.total / stats.count;
                } else {
                    monthlyData[m][year] = null;
                }
            });
        });

        return {
            chartData: Object.values(monthlyData),
            years: targetYears
        };
    }, [data]);

    return (
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}>
            <div className="flex items-center space-x-2 mb-6">
                <CalendarClock className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-bold text-white">Year-over-Year Trends</h3>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yoyData.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickFormatter={(val) => `₹${val}`} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            formatter={(val: number) => `₹${val.toFixed(0)}`}
                        />
                        <Legend />
                        {yoyData.years.map((year, idx) => {
                            const colors = ['#10b981', '#3b82f6', '#9ca3af']; // Green (Current), Blue (Last), Gray (Prev)
                            const strokes = [3, 2, 2];
                            return (
                                <Line
                                    key={year}
                                    type="monotone"
                                    dataKey={year}
                                    name={year.toString()}
                                    stroke={colors[idx] || '#fff'}
                                    strokeWidth={strokes[idx] || 1}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Comparing monthly average prices for the last 3 years.</p>
        </div>
    );
};
