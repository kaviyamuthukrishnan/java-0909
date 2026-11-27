import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_COLORS = ['#14532D', '#22C55E', '#EA580C', '#0D9488', '#64748B'];

export interface InventoryChartPoint {
  label: string;
  prepared: number;
  sold: number;
  surplus: number;
}

export function WeeklyInventoryChart({ data }: { data: InventoryChartPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8E4',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="prepared" name="Prepared (Meals)" fill="#14532D" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sold" name="Sold (Meals)" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="surplus" name="Surplus (Meals)" fill="#EA580C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface PredictionComparisonPoint {
  date: string;
  predicted: number;
  actual: number;
}

export function PredictionVsActualChart({ data }: { data: PredictionComparisonPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8E4',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted Surplus"
            stroke="#EA580C"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Surplus"
            stroke="#14532D"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface MonthlyTrendPoint {
  period: string;
  rescued: number;
  unclaimed: number;
}

export function MonthlyRescueTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#4A5950' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8E4',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="rescued"
            name="Meals Rescued"
            stroke="#14532D"
            fill="#DCFCE7"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="unclaimed"
            name="Unclaimed / Wasted"
            stroke="#EA580C"
            fill="#FFEDD5"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface CategorySlice {
  name: string;
  value: number;
}

export function CategoryBreakdownChart({ data }: { data: CategorySlice[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8E4',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
