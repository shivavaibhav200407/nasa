import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import type { DailySnapshot } from '../types/mission';

interface ResourceTrendsChartProps {
  history: DailySnapshot[];
}

export const ResourceTrendsChart: React.FC<ResourceTrendsChartProps> = ({ history }) => {
  const [activeTab, setActiveTab] = useState<'life_support' | 'power_food'>('life_support');

  if (!history || history.length === 0) {
    return (
      <div className="hud-card p-6 text-center text-xs font-mono text-slate-400">
        No telemetry history recorded yet. Advance Day 1 to populate multi-day historical trajectories.
      </div>
    );
  }

  const chartData = history.map((s) => ({
    day: `Sol ${s.day_number}`,
    dayNum: s.day_number,
    Oxygen: s.oxygen_level,
    Water: s.water_level,
    Battery: s.battery_level,
    Food: s.food_level,
  }));

  return (
    <div className="hud-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-space-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-lunar-cyan/10 border border-lunar-cyan/30 text-lunar-cyan">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold">
            Multi-Day Outpost Telemetry Trajectory
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-space-800 text-xs font-mono shadow-inner">
          <button
            onClick={() => setActiveTab('life_support')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'life_support'
                ? 'bg-lunar-cyan text-space-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Oxygen & Water</span>
          </button>

          <button
            onClick={() => setActiveTab('power_food')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'power_food'
                ? 'bg-amber-400 text-space-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Energy & Food</span>
          </button>
        </div>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#161e2e" />
            <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(6, 9, 17, 0.95)',
                borderColor: '#222f46',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '11px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: 'monospace',
                paddingTop: '8px',
              }}
            />

            {activeTab === 'life_support' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="Oxygen"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#38bdf8' }}
                  activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 2, fill: '#fff' }}
                  name="Atmospheric O2 (units)"
                />
                <Line
                  type="monotone"
                  dataKey="Water"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#22d3ee' }}
                  activeDot={{ r: 5, stroke: '#22d3ee', strokeWidth: 2, fill: '#fff' }}
                  name="Potable Water (L)"
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="Battery"
                  stroke="#facc15"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#facc15' }}
                  activeDot={{ r: 5, stroke: '#facc15', strokeWidth: 2, fill: '#fff' }}
                  name="Battery Storage (kWh)"
                />
                <Line
                  type="monotone"
                  dataKey="Food"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#34d399' }}
                  activeDot={{ r: 5, stroke: '#34d399', strokeWidth: 2, fill: '#fff' }}
                  name="Rations Supply (units)"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
