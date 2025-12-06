import React, { useMemo } from 'react';
import { CardamomPrice } from '@/lib/types';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ZAxis
} from 'recharts';
import { Activity } from 'lucide-react';

interface SupplyScatterProps {
    data: CardamomPrice[];
}

export const SupplyScatter: React.FC<SupplyScatterProps> = ({ data }) => {

    const scatterData = useMemo(() => {
        // Sample down to avoid browser crash on 5000 dots
        // Take representative sample (e.g. random 500 or every 10th)
        let processed = data.map(item => {
            const price = typeof item.price === 'string' ? parseFloat((item.price as string).replace(/,/g, '')) : item.price;
            const qty = typeof item.totalQty === 'string' ? parseFloat((item.totalQty as string).replace(/,/g, '')) : (item.totalQty || 0);
            return { x: qty, y: price, name: item.date };
        }).filter(p => !isNaN(p.x) && !isNaN(p.y) && p.x > 0 && p.y > 0);

        if (processed.length > 500) {
            // Simple deterministic downsampling
            const step = Math.ceil(processed.length / 500);
            processed = processed.filter((_, i) => i % step === 0);
        }
        return processed;
    }, [data]);

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-bold text-white">Supply Impact (Price vs Qty)</h3>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Quantity"
                            unit=" Kg"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'}
                            label={{ value: 'Arrival Quantity', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Price"
                            unit="₹"
                            stroke="#9ca3af"
                            fontSize={12}
                            label={{ value: 'Avg Price', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        />
                        <Scatter name="Auctions" data={scatterData} fill="#f97316" fillOpacity={0.6} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="text-gray-500 text-xs mt-4 text-center">
                Visualizing correlation between Total Quantity Arrived and Average Price.
            </p>
        </div>
    );
};
