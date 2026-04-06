import React from 'react';
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

interface HydrationChartProps {
  isDarkMode: boolean;
}

interface ChartDataPoint {
  label: string;
  ml: number;
}

const weeklyData: ChartDataPoint[] = [
  { label: 'Mon', ml: 2500 },
  { label: 'Tue', ml: 2100 },
  { label: 'Wed', ml: 2800 },
  { label: 'Thu', ml: 1800 },
  { label: 'Fri', ml: 2400 },
  { label: 'Sat', ml: 3000 },
  { label: 'Sun', ml: 2200 },
];

const monthlyData: ChartDataPoint[] = [
  { label: 'W1', ml: 15400 },
  { label: 'W2', ml: 16800 },
  { label: 'W3', ml: 14200 },
  { label: 'W4', ml: 17500 },
];

export const HydrationChart: React.FC<HydrationChartProps> = ({ isDarkMode }) => {
  const [view, setView] = React.useState<'week' | 'month'>('week');
  const data = view === 'week' ? weeklyData : monthlyData;
  const goal = 2500; // Daily goal for week view, or weekly goal for month view

  return (
    <div className={`p-5 border-t ${
      isDarkMode ? 'bg-slate-900/50 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Hydration History
        </h3>
        <div className={`flex p-0.5 rounded-lg ${
          isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
        }`}>
          <button 
            onClick={() => setView('week')}
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${
              view === 'week' 
                ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (isDarkMode ? 'text-slate-500' : 'text-slate-500')
            }`}
          >
            WEEK
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${
              view === 'month' 
                ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (isDarkMode ? 'text-slate-500' : 'text-slate-500')
            }`}
          >
            MONTH
          </button>
        </div>
      </div>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} 
            />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 600 }}
              dy={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9', radius: 4 }}
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Bar 
              dataKey="ml" 
              radius={[4, 4, 0, 0]}
              barSize={view === 'week' ? 24 : 40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.ml >= (view === 'week' ? goal : goal * 7) ? '#3b82f6' : (isDarkMode ? '#1e293b' : '#cbd5e1')} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
