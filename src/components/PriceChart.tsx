'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface PriceChartProps {
    data: any[];
    title: string;
    color?: string;
    dataKey?: string;
    yLabel?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
    data,
    title,
    color = "#10b981",
    dataKey = "price",
    yLabel = "Price"
}) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // formatting date for shorter display if needed
    // Data is expected to be passed in correct order now (or handled by parent)
    // The parent currently slices and user might want specific order.
    // Existing code did `[...data].reverse()`. Let's keep that behavior if it expects newest-first input.
    const chartData = [...data].reverse();

    if (!mounted) return <div className="w-full h-[400px] bg-white/5 rounded-2xl animate-pulse" />;

    return (
        <div className="w-full h-[400px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`color-${dataKey}-${title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                        label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color-${dataKey}-${title})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
