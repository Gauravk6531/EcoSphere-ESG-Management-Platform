import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Leaf, Target, Users, Zap, AlertCircle, ArrowUpRight, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, unit, icon: Icon, trend, color, linkTo }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-600 shadow-sm`}>
        <Icon size={24} />
      </div>
    </div>
    {linkTo && (
      <Link to={linkTo} className={`absolute bottom-0 right-0 w-full h-1 bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
    )}
  </div>
);

const Overview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ summary: null, goals: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, goalsRes] = await Promise.all([
          API.get('/carbon/summary').catch(() => ({ data: { data: { totalEmissions: 0, monthlyTrend: [] } } })),
          API.get('/goals').catch(() => ({ data: { data: [] } }))
        ]);
        setData({
          summary: sumRes.data?.data,
          goals: goalsRes.data?.data?.slice(0, 4) || [],
        });
      } catch (err) {
        console.error('Overview data fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, goals } = data;
  const chartData = summary?.monthlyTrend?.length ? summary.monthlyTrend : [
    { month: 'Jan', emissions: 0 }, { month: 'Feb', emissions: 0 }, { month: 'Mar', emissions: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}</h1>
          <p className="text-slate-500 mt-1">Here is a high-level summary of your organization's ESG performance.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/environmental/carbon-transactions" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <Zap size={16} /> Log Activity
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Carbon Emissions" value={summary?.totalEmissions || 0} unit="tCO2e" icon={Leaf} color="emerald" trend={-2.4} linkTo="/environmental/dashboard" />
        <StatCard title="Active Goals" value={goals?.filter(g => g.status === 'Active').length || 0} icon={Target} color="blue" linkTo="/environmental/goals" />
        <StatCard title="Social Score" value="A-" icon={Users} color="indigo" />
        <StatCard title="Governance Rating" value="98/100" icon={AlertCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Emission Trends</h3>
            <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg focus:ring-0 cursor-pointer">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini widgets */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full opacity-20 blur-2xl" />
            <h3 className="font-bold text-lg mb-1 relative z-10">Net Zero Target</h3>
            <p className="text-slate-400 text-sm mb-4 relative z-10">Your organization is on track to hit Net Zero by 2030.</p>
            <div className="relative z-10">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Progress</span>
                <span>45%</span>
              </div>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Recent Goals</h3>
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No active goals.</p>
            ) : (
              <div className="space-y-4">
                {goals.map(g => {
                  const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) || 0;
                  return (
                    <div key={g._id} className="group">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-slate-700 truncate pr-2" title={g.title}>{g.title}</span>
                        <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 group-hover:bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
