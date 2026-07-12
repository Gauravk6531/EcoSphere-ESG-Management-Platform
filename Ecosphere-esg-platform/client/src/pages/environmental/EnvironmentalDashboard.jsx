import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Leaf, BarChart2, Zap, Droplet, Wind, CloudRain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

const EnvironmentalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await API.get('/carbon/summary');
        setSummary(data.data);
      } catch (err) {
        console.error('Failed to fetch environmental summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!summary) return <div>Error loading data</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="text-emerald-600" /> Environmental Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Detailed breakdown of carbon emissions across departments and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><CloudRain size={28} /></div>
          <div><p className="text-sm font-semibold text-slate-500">Total Emissions</p><h3 className="text-2xl font-bold text-slate-800">{summary.totalEmissions} <span className="text-sm font-normal text-slate-500">tCO2e</span></h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Leaf size={28} /></div>
          <div><p className="text-sm font-semibold text-slate-500">Transactions Logged</p><h3 className="text-2xl font-bold text-slate-800">{summary.transactionCount}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Emissions by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.departmentBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" name="Emissions (tCO2e)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Emissions by Activity Source</h3>
          <div className="h-80 flex flex-col items-center">
            {(!summary.activityBreakdown || summary.activityBreakdown.length === 0) ? (
               <div className="flex-1 flex items-center justify-center text-slate-400">No activity data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.activityBreakdown}
                    cx="50%" cy="45%"
                    innerRadius={80} outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {summary.activityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalDashboard;
