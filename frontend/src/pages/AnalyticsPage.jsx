import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Heart, MessageCircle, Eye, Users, Loader2 } from 'lucide-react';

const PERIODS = [{ label: '7 Days', value: '7d' }, { label: '30 Days', value: '30d' }, { label: '90 Days', value: '90d' }];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => analyticsAPI.getMyAnalytics(period).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  const { summary, dailyData, topPosts } = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p.value ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Posts" value={summary?.totalPosts || 0} icon={TrendingUp} color="bg-primary-500/20 text-primary-400" />
        <StatCard label="Total Likes" value={summary?.totalLikes || 0} icon={Heart} color="bg-red-500/20 text-red-400" />
        <StatCard label="Total Comments" value={summary?.totalComments || 0} icon={MessageCircle} color="bg-accent-500/20 text-accent-400" />
        <StatCard label="Total Views" value={summary?.totalViews || 0} icon={Eye} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard label="Followers" value={summary?.followers || 0} icon={Users} color="bg-amber-500/20 text-amber-400" />
        <StatCard label="Engagement Rate" value={`${(summary?.engagementRate || 0).toFixed(1)}%`} icon={TrendingUp} color="bg-cyan-500/20 text-cyan-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Engagement Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#0ea5e9" fill="url(#engGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Likes vs Comments</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="likes" name="Likes" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts */}
      {topPosts?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Top Performing Posts</h2>
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <div key={post._id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                <span className="text-xl font-bold text-slate-700 w-6 text-center">#{i + 1}</span>
                <p className="flex-1 text-sm text-slate-400 truncate">{post.content || '(No caption)'}</p>
                <div className="flex gap-3 text-xs text-slate-500 shrink-0">
                  <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" />{post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} className="text-accent-400" />{post.comments}</span>
                  <span className="flex items-center gap-1"><Eye size={12} className="text-emerald-400" />{post.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
