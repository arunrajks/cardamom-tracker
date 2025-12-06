import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, color }: StatCardProps) => {
    // Determine color classes
    const colorClasses = {
        emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        orange: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    };

    const activeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald;

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-emerald-500/30 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                    {/* Use suppression for value to allow server/client diff if needed, or ensure stable format */}
                    <p className="text-2xl font-bold text-white mt-1" suppressHydrationWarning>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${activeColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center space-x-2 text-sm">
                    <span className={trend.includes('+') ? "text-emerald-400" : "text-rose-400"}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
};
