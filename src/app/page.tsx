'use client';

import React, { useEffect, useState } from 'react';
import { CardamomPrice } from '@/lib/types';
import { PriceChart } from '@/components/PriceChart';
import { StatCard } from '@/components/ui/StatCard';
import { PricePerformanceChart } from '@/components/analytics/PricePerformanceChart';
import { MarketComparison } from '@/components/analytics/MarketComparison';
import { YoYTrendsChart } from '@/components/analytics/YoYTrendsChart';
import { SeasonalCycleChart } from '@/components/analytics/SeasonalCycleChart';
import { TrendingUp, DollarSign, Calendar, Activity, BarChart3, Download } from 'lucide-react';

export default function Dashboard() {
    const [dailyPrices, setDailyPrices] = useState<CardamomPrice[]>([]);
    const [historicalPrices, setHistoricalPrices] = useState<CardamomPrice[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamic API Base URL: 
    // Uses NEXT_PUBLIC_API_URL if set (e.g. for Android app pointing to Render),
    // otherwise defaults to internal relative path for standard web app.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Daily Data (Recent)
                const dailyRes = await fetch(`${API_BASE}/api/scrape/daily`);
                const dailyData = await dailyRes.json();

                // Fetch Historical Data
                const historyRes = await fetch(`${API_BASE}/api/scrape/historical`);
                const histData = await historyRes.json();

                if (Array.isArray(dailyData)) setDailyPrices(dailyData);
                if (Array.isArray(histData)) setHistoricalPrices(histData);
            } catch (e) {
                console.error("Failed to fetch data", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const [metric1, setMetric1] = useState('avgPrice');
    const [metric2, setMetric2] = useState('avgPrice');

    const metrics = [
        { key: 'lotSize', label: 'No. of Lots', unit: '' },
        { key: 'totalQty', label: 'Total Qty Arrived', unit: 'Kg' },
        { key: 'soldQty', label: 'Qty Sold', unit: 'Kg' },
        { key: 'maxPrice', label: 'Max Price', unit: '₹/Kg' },
        { key: 'avgPrice', label: 'Avg Price', unit: '₹/Kg' },
    ];

    // Helper to process data for charts (ensure numbers)
    const processData = (data: CardamomPrice[], metricKey: string) => {
        return data.map(item => ({
            ...item,
            // Dynamic key access and conversion
            [metricKey]: typeof item[metricKey as keyof CardamomPrice] === 'string'
                ? parseFloat((item[metricKey as keyof CardamomPrice] as string).replace(/,/g, ''))
                : item[metricKey as keyof CardamomPrice]
        }));
    };

    const latest = dailyPrices[0] || historicalPrices[0];
    const previous = dailyPrices[1] || historicalPrices[1];

    // Calculate some basic stats
    const currentPrice = latest?.price || 0;
    const prevPrice = previous?.price || 0;
    const priceDiff = currentPrice - prevPrice;
    const trend = priceDiff >= 0 ? `+${priceDiff.toFixed(2)}` : `${priceDiff.toFixed(2)}`;

    // Combine data for chart (prefer historical for longer trend, or mix)
    // If historical is just page 1, it overlaps or continues daily. 
    // Let's use historical if available.
    const fullData = historicalPrices.length > 0 ? historicalPrices : dailyPrices;

    // Downsample for the historical chart if too large (e.g. > 500 points)
    // Reduce 5000+ points to ~200 points for performance and better visualization
    const historicalChartData = React.useMemo(() => {
        if (fullData.length <= 500) return fullData;
        const samplingRate = Math.ceil(fullData.length / 500);
        return fullData.filter((_, index) => index % samplingRate === 0);
    }, [fullData]);

    // Derived chart data based on selection
    const last30DaysData = React.useMemo(() => {
        if (!fullData.length) return [];

        // Parse the latest date
        const latestDateStr = fullData[0].date;
        const latestDate = new Date(latestDateStr);
        if (isNaN(latestDate.getTime())) return fullData.slice(0, 30); // Fallback

        // Calculate 30 days ago
        const thirtyDaysAgo = new Date(latestDate);
        thirtyDaysAgo.setDate(latestDate.getDate() - 30);

        return fullData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= thirtyDaysAgo;
        });
    }, [fullData]);

    const chart1Data = processData(last30DaysData, metric1);
    const chart2Data = processData(historicalChartData, metric2);

    const getMetricLabel = (key: string) => metrics.find(m => m.key === key)?.label || key;

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8 font-sans selection:bg-emerald-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Cardamom <span className="text-white">Tracker</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Real-time auction prices and market intelligence</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid - Redesigned */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Left Box: Auction Info */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Calendar className="w-24 h-24 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-2">Latest Auction Details</p>
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{latest?.date || "No Date"}</h2>
                                    <h3 className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                                        {latest?.market || "Unknown Market"}
                                    </h3>
                                    <div className="mt-6 inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full w-fit">
                                        <Activity className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm text-gray-300">Grade: <span className="text-white font-medium">{latest?.grade || "N/A"}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Box: Price Overview */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                                <h3 className="text-gray-400 font-medium tracking-wider uppercase text-sm mb-6 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                    Price Overview (₹/Kg)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Average Price (Current) */}
                                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                        <p className="text-emerald-400 text-xs uppercase font-bold mb-1">Average Price</p>
                                        <p className="text-3xl font-bold text-white">₹{currentPrice.toLocaleString()}</p>
                                        <p className={`text-xs mt-2 font-medium ${priceDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {trend}
                                        </p>
                                    </div>

                                    {/* Max Price */}
                                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                                        <p className="text-blue-400 text-xs uppercase font-bold mb-1">Max Price</p>
                                        <p className="text-3xl font-bold text-white">₹{(latest?.maxPrice || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end text-sm text-gray-400">
                                    <div>
                                        <span className="block text-xs uppercase">Total Qty Arrived</span>
                                        <span className="text-white font-mono">{latest?.totalQty || 0} Kg</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-right">Qty Sold</span>
                                        <span className="text-white font-mono">{latest?.soldQty || 0} Kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Chart Section */}
                        <section className="mt-12 space-y-12">
                            {/* Chart 1: Recent */}
                            <div className="relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <select
                                        value={metric1}
                                        onChange={(e) => setMetric1(e.target.value)}
                                        className="bg-gray-800 text-sm text-white border border-gray-600 rounded-lg px-3 py-1 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                                    </select>
                                </div>
                                <PriceChart
                                    data={chart1Data}
                                    title={`${getMetricLabel(metric1)} (Last 30 Days)`}
                                    color="#10b981"
                                    dataKey={metric1}
                                    yLabel={getMetricLabel(metric1)}
                                />
                            </div>

                            {/* Chart 2: Historical */}
                            <div className="relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <select
                                        value={metric2}
                                        onChange={(e) => setMetric2(e.target.value)}
                                        className="bg-gray-800 text-sm text-white border border-gray-600 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                                    </select>
                                </div>
                                <PriceChart
                                    data={chart2Data}
                                    title={`Historical ${getMetricLabel(metric2)} (All Data)`}
                                    color="#3b82f6"
                                    dataKey={metric2}
                                    yLabel={getMetricLabel(metric2)}
                                />
                            </div>
                        </section>

                        {/* Advanced Analytics Section */}
                        <section className="mt-20">
                            <div className="flex items-center space-x-3 mb-8">
                                <BarChart3 className="w-8 h-8 text-purple-400" />
                                <h2 className="text-3xl font-bold text-white">Advanced Analytics</h2>
                            </div>

                            <div className="space-y-8">
                                {/* Performance Metrics (Full Width) */}
                                <PricePerformanceChart data={fullData} />

                                {/* Seasonal Analysis Grid (Side by Side) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <YoYTrendsChart data={fullData} />
                                    <SeasonalCycleChart data={fullData} />
                                </div>

                                {/* Market Comparison (Full Width) */}
                                <MarketComparison data={fullData} />
                            </div>
                        </section>

                        {/* Recent Data Table */}
                        <section className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Full Auction History</h3>
                                <button
                                    onClick={() => {
                                        const headers = ['Date', 'Market', 'No. of Lots', 'Qty Arrived', 'Qty Sold', 'Max Price', 'Avg Price'];
                                        const csvContent = [
                                            headers.join(','),
                                            ...fullData.map(item => [
                                                item.date,
                                                `"${item.market}"`, // Quote to handle commas in market name
                                                item.lotSize,
                                                item.totalQty,
                                                item.soldQty,
                                                item.maxPrice,
                                                item.price
                                            ].join(','))
                                        ].join('\n');

                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                        const link = document.createElement('a');
                                        const url = URL.createObjectURL(blob);
                                        link.setAttribute('href', url);
                                        link.setAttribute('download', 'cardamom_prices.csv');
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download CSV</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                <table className="w-full text-left text-gray-300">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-gray-700 text-xs uppercase text-gray-400 bg-gray-900 shadow-md">
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Market / Auctioneer</th>
                                            <th className="py-3 px-4 text-right">No. of Lots</th>
                                            <th className="py-3 px-4 text-right">Qty Arrived (Kg)</th>
                                            <th className="py-3 px-4 text-right">Qty Sold (Kg)</th>
                                            <th className="py-3 px-4 text-right">Max Price (₹)</th>
                                            <th className="py-3 px-4 text-right">Avg Price (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {fullData.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors text-sm">
                                                <td className="py-3 px-4 font-medium text-white whitespace-nowrap">{item.date}</td>
                                                <td className="py-3 px-4 max-w-xs truncate text-gray-400" title={item.market}>{item.market}</td>
                                                <td className="py-3 px-4 text-right">{item.lotSize || '-'}</td>
                                                <td className="py-3 px-4 text-right font-mono">{item.totalQty || '-'}</td>
                                                <td className="py-3 px-4 text-right font-mono">{item.soldQty || '-'}</td>
                                                <td className="py-3 px-4 text-right font-mono text-blue-400">{item.maxPrice ? `₹${item.maxPrice.toLocaleString()}` : '-'}</td>
                                                <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">₹{item.price.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
